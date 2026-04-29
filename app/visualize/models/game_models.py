import re
from urllib.parse import parse_qs, urlparse
import uuid
from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.shortcuts import get_object_or_404
from django.utils.text import slugify
from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.utils.translation import gettext_lazy as _
from rest_framework.exceptions import ValidationError
from datetime import timedelta
from django.utils import timezone
import logging
import uuid
import sentry_sdk
from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MaxValueValidator, MinValueValidator
from jsonschema import Draft7Validator, ValidationError as JSONSchemaValidationError
from rest_framework_api_key.models import AbstractAPIKey

from users.models import AccountUser

logger = logging.getLogger(__name__)

IOS_APP_ID_RE = re.compile(r"/id(\d+)")


def generate_unique_slug(model, field_name, value, max_length):
    slug = slugify(value)[:max_length]
    unique_slug = slug
    num = 1
    while model.objects.filter(**{field_name: unique_slug}).exists():
        unique_slug = f"{slug[:max_length-len(str(num))-1]}-{num}"
        num += 1
    return unique_slug


# =====================
# Other models
# =====================


class Person(models.Model):
    name = models.CharField(max_length=256)
    slug = models.SlugField(
        max_length=256,
        unique=True,
        editable=False,
        db_index=True,
        null=True,
        blank=True,
    )

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(self.__class__, "slug", self.name, 256)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        abstract = True


class Publisher(Person):
    """Represents a game publisher."""

    pass


class Developer(Person):
    """Represents a game developer."""

    pass


class Tag(models.Model):
    name = models.CharField(
        max_length=256,
    )
    slug = models.SlugField(
        max_length=256,
        unique=True,
        editable=False,
        db_index=True,
        null=True,
        blank=True,
    )
    short_description = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(self.__class__, "slug", self.name, 256)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        abstract = True


class Skill(Tag):
    """Represents a skill required or developed through the game."""

    pass


class Mood(Tag):
    """Represents the mood evoked by the game."""

    pass


class Session(models.Model):
    """
    Stores the telemetry stream from a given User playing a certain Game, and
     provides an interface to generate skill scores from the telemetry.
    """

    # this model uses a UUID so clients can initiate sessions w/o doing a
    #  server round trip
    session_id = models.UUIDField(default=uuid.uuid4, unique=True)
    user = models.ForeignKey(
        to=settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sessions",
        null=True,
    )
    game = models.ForeignKey(
        to="Game", related_name="sessions", on_delete=models.PROTECT
    )

    at_created = models.DateTimeField(auto_now_add=True)
    duration = models.DurationField(null=True, blank=True)

    # telemetry is an array of events (todo: normalize events)
    telemetry = models.JSONField(default=list)

    class StateChoices(models.TextChoices):
        OPEN = "OPEN"
        CLOSED = "CLOSED"

    state = models.CharField(
        max_length=64, choices=StateChoices.choices, default=StateChoices.OPEN
    )

    class ScoringFlagChoices(models.TextChoices):
        NO_TELEMETRY = "NO_TELEMETRY"
        NOT_CALIBRATED = "NOT_CALIBRATED"
        NOT_PROCESSED = "NOT_PROCESSED"
        PROCESSED = "PROCESSED"
        CALIBRATED = "CALIBRATED"

    stage = models.CharField(
        max_length=32,
        choices=ScoringFlagChoices.choices,
        default=ScoringFlagChoices.NO_TELEMETRY,
    )

    generated_content = models.JSONField(default=dict)

    skill_scores = models.JSONField(default=dict)
    mood_scores = models.JSONField(default=dict)
    gameplay_tips = models.TextField(blank=True, null=True)

    processed = models.BooleanField(default=False)
    is_processing = models.BooleanField(default=False)
    processing_started_at = models.DateTimeField(null=True, blank=True)
    processing_completed_at = models.DateTimeField(null=True, blank=True)
    processing_error = models.TextField(null=True, blank=True)

    # Partner fields
    partner_organization = models.ForeignKey(
        "organizations.Organization",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="partner_sessions",
    )

    target_mood = models.ForeignKey(
        Mood,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    parameter_updates = models.JSONField(default=list)

    @classmethod
    def get_partner_sessions(cls, organization):
        """Get all sessions accessible to a partner organization"""
        return cls.objects.filter(partner_organization=organization)

    def get_chunks(self, processed=True, exclude_errors=True):
        """
        Retrieve either processed or unprocessed chunks for this session.
        
        Args:
            processed (bool): If True, returns processed chunks. If False, returns unprocessed chunks.
            exclude_errors (bool): If True, excludes chunks with processing errors.
            
        Returns:
            QuerySet: Ordered chunks matching the processing criteria
        """
        conditions = (
            models.Q(raw_skill_llm_output={})
            | models.Q(raw_skill_llm_output__isnull=True)
            | models.Q(raw_flow_llm_output={})
            | models.Q(raw_flow_llm_output__isnull=True)
        )
        
        queryset = self.gamechunkanalysis_set
        
        if exclude_errors:
            queryset = queryset.filter(
                models.Q(processing_error__isnull=True) | models.Q(processing_error="")
            )
        
        if processed:
            # Get processed chunks (both outputs have values)
            return queryset.exclude(conditions).order_by("timestamp")
        else:
            # Get unprocessed chunks (at least one output is empty/null)
            return queryset.filter(conditions).order_by("timestamp")

    def get_target_mood(self):
        """Returns the target mood for the session or select one at random if not present"""
        if not self.target_mood:
            target_mood = self.game.moods.order_by("?").first()
            return target_mood.slug if target_mood else "relax"
        return self.target_mood.slug

    @classmethod
    def claim_for_user(cls, session_id: str, user: AccountUser) -> None:
        session: Session = cls.objects.get(session_id=session_id)
        if session.user:
            msg = (
                f"{user} cannot claim session {session_id}: It is already "
                "owned by another user."
            )
            logger.error(msg)
            sentry_sdk.capture_message(msg)
            return
        if user.is_authenticated:
            session.user = user
            session.save()

    def validate_and_normalize(self):
        """
        Validate and normalize telemetry data based on the game schema.
        """
        try:
            validator = self.game.schema.validator()
            errors = []
            normalized_data = []

            for entry in self.telemetry:
                try:
                    validator.validate(entry)
                    normalized_data.append(entry)
                except JSONSchemaValidationError as e:
                    errors.append(e.message)

            if errors:
                raise ValidationError(errors)

            self.telemetry = normalized_data
        except GameSchema.DoesNotExist:
            # No schema defined for this game, skip validation
            return

    def save(self, *args, **kwargs):
        if self.at_created and not self.duration:
            self.duration = timezone.now() - self.at_created
        if self.telemetry:
            assert isinstance(self.telemetry, list)
            self.validate_and_normalize()
            self.telemetry = sorted(
                self.telemetry, key=lambda event: event.get("timestamp", 0)
            )
        super().save(*args, **kwargs)

    class Meta:
        verbose_name_plural = _("sessions")
        indexes = [
            models.Index(fields=["game_id", "user_id", "-at_created"]),
            models.Index(fields=["user_id", "game_id", "-at_created"]),
        ]

    def __str__(self):
        return (
            f"{self.id}: {self.user or 'Unknown user'} played "
            f"{self.game.name} at {self.at_created}"
        )


class Game(models.Model):
    at_created = models.DateTimeField(auto_now_add=True)
    at_updated = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=False)
    name = models.CharField(
        max_length=256,
        unique=True,
        default=None,
        help_text=_("Internal name used to set the slug; avoid changing."),
    )
    slug = models.SlugField(
        max_length=256,
        unique=True,
        editable=False,
        db_index=True,
        null=True,
        blank=True,
    )
    display_name = models.CharField(
        max_length=256,
        default=None,
        help_text=(
            _(
                "User-friendly name to display in UI; change at will. Defaults to "
                "name."
            )
        ),
    )
    short_description = models.TextField()
    long_description = models.TextField(blank=True)
    screenshot = models.URLField(blank=True)
    priority = models.PositiveIntegerField(default=0)
    is_publicly_listed = models.BooleanField(default=False)
    suggested_duration = models.DurationField(default=timedelta(minutes=3))
    is_playable_in_pwa = models.BooleanField(default=False)

    skills = models.ManyToManyField(Skill, blank=True)
    moods = models.ManyToManyField(Mood, blank=True)

    class ExitButtonPosition(models.TextChoices):
        TOP_RIGHT = "TOP_RIGHT", "TOP_RIGHT"
        BOTTOM_RIGHT = "BOTTOM_RIGHT", "BOTTOM_RIGHT"
        TOP_LEFT = "TOP_LEFT", "TOP_LEFT"
        BOTTOM_LEFT = "BOTTOM_LEFT", "BOTTOM_LEFT"

    exit_button_position = models.CharField(
        max_length=16,
        choices=ExitButtonPosition.choices,
        null=True,
        blank=True,
    )

    # columns from our metadata enrichment in airtable
    class GameplayTag(models.TextChoices):
        ACHIEVEMENTS = _("Achievements")
        AUGMENTED_REALITY = _("Augmented Reality")
        AUTO_BATTLE = _("Auto Battle")
        CARD = _("Card")
        CHAT = _("Chat")
        COMPETITIVE = _("Competitive")
        CUSTOMIZATION = _("Customization")
        EVENTS = _("Events")
        FRIEND_INVITES = _("Friend Invites")
        GUILDS = (_("Guilds/Clans"), _("Guilds"))
        HIDDEN_OBJECT = _("Hidden Object")
        LEADERBOARDS = _("Leaderboards")
        LOGIN_REWARDS = (_("Daily/Login Rewards"), _("Login rewards"))
        LUCK = (_("Lucky Spin/Scratch"), _("Luck"))
        MATCH_3 = (_("Match3"), _("Match 3"))
        MERGE = _("Merge")
        MISSIONS = _("Missions")
        MMO = _("MMO")
        MULTIPLAYER = _("Multiplayer")
        MULTIPLE_LEVELS = _("Multiple levels")
        SOCIAL_ASSISTS = _("Social Assists")
        TOURNAMENTS = _("Tournaments")
        UNLIMITED_TIME = _("Unlimited Time")
        UNLIMITED_TRIES = _("Unlimited Tries")

    gameplay_tags = ArrayField(
        models.CharField(max_length=256, choices=GameplayTag.choices),
        blank=True,
        null=True,
    )

    class ArtStyle(models.TextChoices):
        ANIME = _("Anime")
        CARTOONY = _("Cartoony")
        LANDSCAPE = _("Landscape")
        PIXEL_VOXEL = _("Pixel/Voxel")
        PORTRAIT = _("Portrait")
        REALISTIC = _("Realistic")
        THREE_D = _("3D")
        TWO_D = _("2D")

    art_styles = ArrayField(
        models.CharField(max_length=256, choices=ArtStyle.choices),
        blank=True,
        null=True,
    )

    class Theme(models.TextChoices):
        APOCALYPTIC = (_("Apocalyptic/Post"), _("Apocalyptic"))
        CASINO = (_("Casino/Gambling"), _("Casino"))
        DETECTIVE = _("Detective")
        FANTASY_EASTERN = (_("Fantasy (Eastern)"), _("Eastern Fantasy"))
        FANTASY_WESTERN = (_("Fantasy (Western)"), _("Western Fantasy"))
        FARMING = _("Farming")
        FEMALE_ORIENTED = _("Female Oriented")
        HOME_DESIGN = _("Home Design")
        HISTORICAL = (_("Historical/Medieval"), _("Historical"))
        HORROR = _("Horror")
        MODERN_MILITARY = _("Modern Military")
        NATURE = _("Nature")
        ROMANCE = (_("Romance/Love"), _("Romance"))
        SNIPER = _("Sniper")
        SPACE = _("Space")
        SCIFI = _("Sci-Fi")
        WAR = _("War")
        WESTERN_AMERICAN = (_("Western (American)"), _("Western"))

    themes = ArrayField(
        models.CharField(max_length=256, choices=Theme.choices),
        blank=True,
        null=True,
    )

    class Genre(models.TextChoices):
        ACTION = _("Action")
        BOARD = _("Board")
        ARCADE = _("Arcade")
        PUZZLE = _("Puzzle")
        HYPER_CASUAL = _("Hyper-Casual")
        IDLE = _("Idle")
        INDIE = _("Indie")
        KIDS = _("Kids")
        LIFESTYLE = _("Lifestyle")
        PARTY = _("Party")
        RACING = _("Racing")
        RPG = _("RPG")
        SHOOTER = _("Shooter")
        SIMULATION = _("Simulation")
        SPORTS = _("Sports")
        STRATEGY = _("Strategy")
        WORD = _("Word")

    genres = ArrayField(
        models.CharField(max_length=256, choices=Genre.choices),
        blank=True,
        null=True,
    )

    class Goal(models.TextChoices):
        AVOID = _("Avoid")
        CREATE = _("Create")
        CONFIGURE = _("Configure")
        FIND = _("Find")
        OBTAIN = _("Obtain")
        OPTIMIZE = _("Optimize")
        REACH = _("Reach")
        REMOVE = _("Remove")
        SOLVE = _("Solve")
        SYNCHRONIZE = _("Synchronize")

    goals = ArrayField(
        models.CharField(max_length=256, choices=Goal.choices),
        blank=True,
        null=True,
    )

    release_date = models.DateField(blank=True, null=True)

    publisher = models.ForeignKey(
        to="Publisher", on_delete=models.PROTECT, null=True, blank=True
    )

    developer = models.ForeignKey(
        to="Developer", on_delete=models.PROTECT, null=True, blank=True
    )

    ios_store_link = models.URLField(null=True, blank=True)
    android_store_link = models.URLField(null=True, blank=True)
    external_web_url = models.URLField(null=True, blank=True)
    organization = models.ForeignKey(
        to="organizations.Organization",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="games",
    )

    thumbnail = models.ImageField(
        null=True, blank=True, upload_to="thumbnails/%Y/%m/%d/"
    )

    def get_upload_path(instance, filename):
        return f"{instance.slug.replace('-','_')}/{filename}"

    game_zip = models.FileField(
        null=True,
        blank=True,
        upload_to=get_upload_path,
        validators=[FileExtensionValidator(allowed_extensions=["zip"])],
    )
    game_path = models.CharField(null=True, blank=True, max_length=128)
    sdk_enabled = models.BooleanField(default=False)

    class ScreenshotOrientation(models.TextChoices):
        LANDSCAPE = "landscape"
        PORTRAIT = "portrait"

    orientation = models.CharField(
        max_length=16,
        choices=ScreenshotOrientation.choices,
        default=ScreenshotOrientation.PORTRAIT,
    )

    class GameEngineType(models.TextChoices):
        UNITY = "unity", "Unity WebGL"
        HTML5_JS = "html5_js", "HTML5/JavaScript"
        CONSTRUCT = "construct", "Construct 3"
        PHASER = "phaser", "Phaser"
        GODOT_HTML5 = "godot_html5", "Godot HTML5"
        CUSTOM_JS = "custom_js", "Custom JavaScript"

    engine_type = models.CharField(
        max_length=32,
        choices=GameEngineType.choices,
        default=GameEngineType.HTML5_JS,
    )

    html5_entry_file = models.CharField(
        max_length=128,
        default="index.html",
        help_text="The HTML file to load as the entry point for HTML5/JS games",
    )

    requires_iframe = models.BooleanField(
        default=False, help_text="Whether the game requires being embedded in an iframe"
    )

    html5_init_params = models.JSONField(
        default=dict,
        blank=True,
        help_text="Initialization parameters to pass to the game via URL query string",
    )

    def save(self, *args, **kwargs):
        if not self.display_name:
            self.display_name = self.name
        if not self.slug:
            self.slug = generate_unique_slug(self.__class__, "slug", self.name, 256)
        if self.pk:
            old_game = Game.objects.get(pk=self.pk)
            if old_game.game_zip != self.game_zip:
                # Set game_path to None when game_zip is updated
                self.game_path = None

        super().save(*args, **kwargs)

    def slugify(self):
        return f"{slugify(self.name)}-{self.id}"
    
    @property
    def game_files_path(self) -> str:
        # Strip the UUID suffix that generate_unique_slug appends.
        # e.g. "hextris-475aff99-6346-4ea4-b432-dc8aa51f2178" → "hextris"
        import re
        base = re.sub(
            r'-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
            '',
            self.slug,
        )
        return f"{base.replace('-', '_').lower()}_web"

    def __str__(self):
        if not self.is_active:
            return f"{self.name} [INACTIVE]"
        return self.name

    @property
    def url(self) -> str | None:
        """CDN link to the `index` page to embed this game in an iframe"""
        if self.is_playable_in_pwa and not self.game_zip and self.external_web_url:
            return self.external_web_url
        if not self.is_playable_in_pwa or not self.game_zip:
            return None
        if settings.IS_DEV:
            # Return the URL using the media local path
            return f"http://localhost:8002{settings.MEDIA_URL}{self.game_zip.name}/game/index.html".replace(
                ".zip", ""
            )
        else:
            # Return the original URL
            return f"{settings.GAMES_CDN}/media/{self.game_zip.name}/game/index.html"

    @property
    def android_package_id(self) -> str | None:
        if not self.android_store_link:
            return None
        parse = urlparse(self.android_store_link)
        if parse.hostname != "play.google.com":
            raise ValidationError("Must link to play.google.com")
        qs = parse.query
        id_ = parse_qs(qs)["id"]
        if len(id_) != 1:
            raise ValidationError("Android store URL must contain exactly 1 ID")
        return id_[0]

    @property
    def ios_app_id(self) -> str | None:
        if not self.ios_store_link:
            return None
        parse = urlparse(self.ios_store_link)
        if parse.hostname != "apps.apple.com":
            raise ValidationError("Must link to apps.apple.com")
        path = parse.path
        id_ = re.findall(IOS_APP_ID_RE, path)
        if len(id_) != 1:
            raise ValidationError("iOS store URL must contain exactly 1 ID")
        return id_[0]

    @classmethod
    def instance_from_slug(cls, slug):
        return get_object_or_404(cls, slug=slug)

    def moods_names(self):
        return [mood.name for mood in self.moods.all()]

    def skills_names(self):
        return [skill.name for skill in self.skills.all()]


class Survey(models.Model):
    at_created = models.DateTimeField(auto_now_add=True)
    at_updated = models.DateTimeField(auto_now=True)
    game = models.ForeignKey(
        Game,
        on_delete=models.CASCADE,
    )
    score = models.SmallIntegerField(
        default=0,
        validators=[
            MinValueValidator(-1),
            MaxValueValidator(1),
        ],
    )
    user = models.ForeignKey(
        to=settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        help_text="If null, it was submitted by an anonimous user.",
    )
    session = models.ForeignKey(
        Session,
        to_field="session_id",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="%(class)s_surveys",  # This will be replaced with the actual class name
    )

    def __str__(self):
        return f"Survey for {self.game} (User: {self.user})"

    class Meta:
        abstract = True


class SkillSurvey(Survey):
    """Represents the result of a post-game skill survey."""

    skill = models.ForeignKey(
        Skill, related_name="surveys", on_delete=models.SET_NULL, null=True
    )
    skills = models.ManyToManyField(Skill)


class MoodSurvey(Survey):
    """Represents the result of a post-game mood survey."""

    mood = models.ForeignKey(
        Mood,
        related_name="surveys",
        on_delete=models.CASCADE,
    )


class Favorite(models.Model):
    """
    This class represents the list of favorite games of a user and the groupping of games by name
    """

    at_created = models.DateTimeField(auto_now_add=True)
    game = models.ForeignKey(
        Game,
        on_delete=models.CASCADE,
    )
    user = models.ForeignKey(
        to=settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return f"{self.game} (User: {self.user})"


class GameSchema(models.Model):
    """
    Stores the schema for telemetry events for a particular game.
    """

    game = models.OneToOneField(
        to=Game,
        on_delete=models.CASCADE,
        related_name="schema",
        null=True,
    )
    schema = models.JSONField(
        default={
            "$schema": "http://json-schema.org/draft-07/schema#",
            "type": "object",
            "properties": {
                "event": {"type": "string"},
                "level": {"type": "integer"},
                "timestamp": {"type": "number"},
                "game_name": {
                    "type": "string",
                    "default": "other",
                    "enum": [
                        "Gems of Hanoi",  # Fixure pk 66
                        "Photo Hunt",  # Fixure pk 65
                        "Fruit Boom",  # Fixure pk 58
                        "Fruit Sorting",  # Fixure pk 85
                        "Sumagi",  # Fixure pk 83
                        "Hextris",  # Fixure pk 84
                        "Match Doodle",  # Fixure pk 86
                        "Ultimate Sudoku",  # Fixure pk 61
                        "Sweet Memory",  # Fixure pk 81
                        "0hh1",  # Fixure pk 82
                        "other",
                    ],
                },
            },
            "required": ["event", "timestamp", "game_name"],
            "additionalProperties": True,
        }
    )

    DEFAULT_SPLIT_EVENTS = [
        "LEVEL_COMPLETE",
        "LEVEL_FAILED",
        "LEVEL_RESTART",
        "LEVEL_QUIT",
    ]
    RAW_SCORE_TRIGGER_EVENTS = DEFAULT_SPLIT_EVENTS + ["GAME_END"]
    CONTROL_EVENTS = DEFAULT_SPLIT_EVENTS + [
        "GAME_START",
        "LEVEL_START",
        "GAME_END",
    ]
    POSITIVE_EVENTS = [
        "LEVEL_START",
        "LEVEL_COMPLETE",
        "GENERIC_POSITIVE",
    ]
    NEGATIVE_EVENTS = [
        "LEVEL_QUIT",
        "LEVEL_FAILED",
        "LEVEL_RESTART",
        "HINT",
        "GENERIC_NEGATIVE",
    ]

    def __str__(self):
        return f"Schema [{self.game.name}]"

    def validator(self):
        return Draft7Validator(self.schema)
