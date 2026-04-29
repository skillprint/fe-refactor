from pathlib import Path
from django.db import models, transaction
from django.utils import timezone
from datetime import timedelta
from django.contrib.postgres.fields import ArrayField
from rest_framework.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from typing import Dict

from skillprint.storage_backends import PrivateMediaStorage


class GameChunkAnalysis(models.Model):
    """
    Stores the LLM's analysis of each game frame
    """

    session = models.ForeignKey(to="games.Session", on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)

    def validate_image_extension(value):
        allowed_extensions = ["jpeg", "webp", "jpg"]
        if isinstance(value, str):
            # For string paths, validate the extension directly
            extension = Path(value).suffix[1:].lower()
            if extension not in allowed_extensions:
                raise ValidationError(
                    f'File extension "{extension}" is not allowed. '
                    f'Allowed extensions are: {", ".join(allowed_extensions)}'
                )
        else:
            # For file objects, use Django's validator
            FileExtensionValidator(allowed_extensions=allowed_extensions)(value)

    def get_upload_path_images(instance, filename):
        return f"image_recordings/%Y/%m/%d/{instance.session.id}/{filename}"

    def get_upload_path_video(instance, filename):
        now = timezone.now()
        return now.strftime(
            f"video_recordings/%Y/%m/%d/{instance.session.id}/{filename}"
        )

    # Using ArrayField for multiple image paths
    images = ArrayField(
        models.ImageField(
            storage=PrivateMediaStorage(),
            upload_to=get_upload_path_images,
            validators=[validate_image_extension],
            null=True,
            blank=True,
        ),
        blank=True,
        null=True,
    )

    video = models.FileField(
        storage=PrivateMediaStorage(),
        upload_to=get_upload_path_video,
        validators=[FileExtensionValidator(allowed_extensions=["webm", "mp4"])],
        null=True,
        blank=True,
    )
    raw_skill_llm_output = models.JSONField(default=dict, blank=True)
    raw_flow_llm_output = models.JSONField(default=dict, blank=True)
    skill_llm_output = models.JSONField(default=dict, blank=True)
    flow_llm_output = models.JSONField(default=dict, blank=True)

    is_processing = models.BooleanField(default=False)
    processing_started_at = models.DateTimeField(null=True, blank=True)
    processing_error = models.TextField(null=True, blank=True)
    processing_attempts = models.IntegerField(default=0)
    last_processing_attempt = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["session", "timestamp"]),
        ]

    def __str__(self):
        return f"{self.id}: {self.session.id} - {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}"

    def clean(self):
        if self.images and self.video:
            raise ValidationError("Cannot have both images and video.")
        if not self.images and not self.video:
            raise ValidationError("Must provide either images or video.")

    def save(self, *args, **kwargs):
        # Only run full_clean on creation (not on processing-time updates)
        # to avoid ValidationError on stale file references during chunk processing.
        if not self.pk:
            self.full_clean()
        super().save(*args, **kwargs)

    def get_image_count(self):
        return len(self.images) if self.images else 0

    def get_images_display(self):
        if not self.images:
            return "No images"
        return f"{len(self.images)} images"

    get_images_display.short_description = "Images"

    def is_processed(self):
        """
        Check if the chunk has been processed with both skill and flow LLM outputs.
        Uses existing fields and handles both empty dicts and None values.
        """
        skill_data = self.raw_skill_llm_output
        flow_data = self.raw_flow_llm_output

        # Check if skill data is valid (not empty dict or None)
        skill_valid = (
            skill_data and skill_data != {} if skill_data is not None else False
        )

        # Check if flow data is valid (not empty dict or None)
        flow_valid = flow_data and flow_data != {} if flow_data is not None else False

        return skill_valid and flow_valid


class MediaChunkProcessor:
    """
    Processes media chunks to calculate skill metrics and flow states
    """

    def __init__(self):
        from scoring.flow import FlowStateManager
        from scoring.skill import SkillMetricCalculator

        self.flow_manager = FlowStateManager()
        self.skill_calculator = SkillMetricCalculator()

    def process_chunk(self, chunk: GameChunkAnalysis, target_mood: str) -> Dict:
        """
        Process a single media chunk to extract skill and flow metrics

        Args:
            chunk: GameChunkAnalysis instance containing media and metadata
            target_mood: Target mood enum value for flow calculation

        Returns:
            Dictionary containing calculated metrics
        """
        # Extract frame indicators from media
        flow_indicators = chunk.raw_flow_llm_output

        # Validate flow indicators
        if not flow_indicators or not isinstance(flow_indicators, dict):
            return {
                "flow_metrics": {
                    "flow_score": 0,
                    "confidence": 0,
                    "target_mood": target_mood,
                    "error": "Invalid flow indicators",
                },
                "skill_metrics": {},
            }

        # Calculate flow metrics
        flow_score, flow_confidence = self.flow_manager.process_frame(
            flow_indicators, target_mood
        )

        # Calculate skill metrics using raw LLM output
        skill_metrics = {
            "pattern-matching": self.skill_calculator.calculate_pattern_recognition(
                [chunk]
            ),
            "attention": self.skill_calculator.calculate_attention_score([chunk]),
            "memory": self.skill_calculator.calculate_memory_score([chunk]),
            "planning": self.skill_calculator.calculate_planning_score([chunk]),
            "task-switching": self.skill_calculator.calculate_task_switching([chunk]),
            "math": self.skill_calculator.calculate_math_score([chunk]),
            "deduction": self.skill_calculator.calculate_deduction_score([chunk]),
            "visualization": self.skill_calculator.calculate_visualization_score(
                [chunk]
            ),
            "verbal": self.skill_calculator.calculate_verbal_score([chunk]),
            "timing": self.skill_calculator.calculate_timing_score([chunk]),
            "perceptual-speed": self.skill_calculator.calculate_reaction_time([chunk]),
            "knowledge": self.skill_calculator.calculate_knowledge_score([chunk]),
            "action": self.skill_calculator.calculate_motor_skills([chunk]),
            "spatial": self.skill_calculator.calculate_spatial_awareness([chunk]),
        }

        # Store results in chunk
        chunk.flow_llm_output = {
            "flow_score": flow_score,
            "confidence": flow_confidence,
            "target_mood": target_mood,
        }

        chunk.skill_llm_output = skill_metrics
        chunk.save(update_fields=["flow_llm_output", "skill_llm_output"])

        return {
            "flow_metrics": chunk.flow_llm_output,
            "skill_metrics": chunk.skill_llm_output,
        }


class SkillPrintProfile(models.Model):
    """
    Aggregate profile containing user's historical skill development and flow states
    """

    user = models.OneToOneField("users.AccountUser", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)
    total_sessions = models.IntegerField(default=0)
    total_time_played = models.DurationField(default=timedelta())

    # Aggregate flow metrics
    avg_flow_score = models.FloatField(default=0.0)
    flow_score_history = models.JSONField(default=list)
    flow_confidence = models.FloatField(default=0.0)

    # Player state distributions
    state_distributions = models.JSONField(default=dict)

    class Meta:
        indexes = [
            models.Index(fields=["user", "last_updated"]),
        ]

    def __str__(self):
        return f"{self.id}: {self.user}"


class GameScoringConfig(models.Model):
    """
    Per-game scoring configuration, editable from the Django admin.

    Controls how the LLM analyzes gameplay media and generates parameter
    adjustments.  When a config exists for a game, the task pipeline will:
      1. Merge custom prompts / schemas into the LLM calls.
      2. Extend the flow-analysis response schema with a ``parameter_updates``
         object whose fields come from ``parameter_definitions``.
      3. Validate & clamp the LLM's output against the defined ranges before
         storing the adjustments on the session.

    Games *without* a config continue to use the legacy hard-coded scoring.
    """

    game = models.OneToOneField(
        to="games.Game",
        on_delete=models.CASCADE,
        related_name="scoring_config",
    )
    is_enabled = models.BooleanField(
        default=True,
        help_text="Toggle parameter adjustments on/off for this game.",
    )

    # ── LLM Prompt Overrides ──────────────────────────────────────────────
    skill_prompt_override = models.TextField(
        blank=True,
        default="",
        help_text=(
            "Custom LLM prompt for skill analysis. "
            "Leave blank to use the default SkillSchema prompt."
        ),
    )
    flow_prompt_override = models.TextField(
        blank=True,
        default="",
        help_text=(
            "Custom LLM prompt for flow/mood analysis. "
            "Leave blank to use the default MoodSchema prompt."
        ),
    )
    adjustment_instructions = models.TextField(
        blank=True,
        default="",
        help_text=(
            "Game-specific instructions appended to the flow prompt.  "
            "Tells the LLM how to reason about parameter adjustments for "
            "this game (e.g. 'For relax, slow down spawns…')."
        ),
    )

    # ── Schema Overrides ──────────────────────────────────────────────────
    skill_schema_override = models.JSONField(
        null=True,
        blank=True,
        default=None,
        help_text=(
            "Custom JSON Schema (Draft-7 style) for the skill LLM response. "
            "Null = use the default schema."
        ),
    )
    flow_schema_override = models.JSONField(
        null=True,
        blank=True,
        default=None,
        help_text=(
            "Custom JSON Schema (Draft-7 style) for the flow LLM response. "
            "Null = use the default schema."
        ),
    )

    # ── Parameter Definitions ─────────────────────────────────────────────
    parameter_definitions = models.JSONField(
        default=dict,
        blank=True,
        help_text=(
            "Defines adjustable game parameters.  Each key is the parameter "
            "name; the value is an object with: type (number|integer|boolean), "
            "min, max, default, description.  Example:\n"
            '{"speed": {"type":"number","min":0.1,"max":2.0,"default":1.0,'
            '"description":"Game speed multiplier"}}'
        ),
    )

    # ── Meta ──────────────────────────────────────────────────────────────
    notes = models.TextField(
        blank=True,
        default="",
        help_text="Admin-only documentation / notes about this config.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Game Scoring Config"
        verbose_name_plural = "Game Scoring Configs"

    def __str__(self):
        return f"ScoringConfig [{self.game.name}]"

    def clean(self):
        """Validate parameter_definitions structure on save."""
        from django.core.exceptions import ValidationError as DjangoValidationError

        if self.parameter_definitions:
            required_keys = {"type", "min", "max"}
            for param_name, defn in self.parameter_definitions.items():
                if not isinstance(defn, dict):
                    raise DjangoValidationError(
                        {
                            "parameter_definitions": (
                                f'"{param_name}" must be an object, '
                                f"got {type(defn).__name__}."
                            )
                        }
                    )
                missing = required_keys - set(defn.keys())
                if missing:
                    raise DjangoValidationError(
                        {
                            "parameter_definitions": (
                                f'"{param_name}" is missing required keys: '
                                f"{', '.join(sorted(missing))}."
                            )
                        }
                    )
