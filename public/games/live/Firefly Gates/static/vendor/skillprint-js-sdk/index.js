// src/constants.ts
var ApiEnvironment = /* @__PURE__ */ ((ApiEnvironment2) => {
  ApiEnvironment2["PRODUCTION"] = "production";
  ApiEnvironment2["STAGING"] = "staging";
  return ApiEnvironment2;
})(ApiEnvironment || {});
var ParameterType = /* @__PURE__ */ ((ParameterType2) => {
  ParameterType2["FLOAT"] = "Float";
  ParameterType2["INTEGER"] = "Integer";
  ParameterType2["BOOLEAN"] = "Boolean";
  return ParameterType2;
})(ParameterType || {});
var Mood = /* @__PURE__ */ ((Mood2) => {
  Mood2["RELAX"] = "relax";
  Mood2["FOCUS"] = "focus";
  Mood2["CREATIVITY"] = "creativity";
  Mood2["COLLABORATE"] = "collaborate";
  Mood2["GRIT"] = "grit";
  Mood2["JOY"] = "joy";
  Mood2["CURIOSITY"] = "curiosity";
  Mood2["EMPATHY"] = "empathy";
  Mood2["AWE"] = "awe";
  return Mood2;
})(Mood || {});
var LogLevel = /* @__PURE__ */ ((LogLevel2) => {
  LogLevel2["INFO"] = "info";
  LogLevel2["WARNING"] = "warning";
  LogLevel2["ERROR"] = "error";
  return LogLevel2;
})(LogLevel || {});
var GameEvent = /* @__PURE__ */ ((GameEvent4) => {
  GameEvent4["GAME_START"] = "GAME_START";
  GameEvent4["GAME_END"] = "GAME_END";
  GameEvent4["GAME_PAUSE"] = "GAME_PAUSE";
  GameEvent4["GAME_RESUME"] = "GAME_RESUME";
  GameEvent4["LEVEL_START"] = "LEVEL_START";
  GameEvent4["LEVEL_COMPLETE"] = "LEVEL_COMPLETE";
  GameEvent4["LEVEL_QUIT"] = "LEVEL_QUIT";
  GameEvent4["LEVEL_FAILED"] = "LEVEL_FAILED";
  GameEvent4["LEVEL_RESTART"] = "LEVEL_RESTART";
  GameEvent4["MATCH"] = "MATCH";
  GameEvent4["UNMATCH"] = "UNMATCH";
  GameEvent4["HINT"] = "HINT";
  GameEvent4["GENERIC_POSITIVE"] = "GENERIC_POSITIVE";
  GameEvent4["GENERIC_NEGATIVE"] = "GENERIC_NEGATIVE";
  return GameEvent4;
})(GameEvent || {});
function isUniversalEvent(name) {
  return Object.values(GameEvent).includes(name);
}

// src/config.ts
var SkillprintConfig = class {
  constructor(options = {}) {
    this.gameName = options.gameName || "GAME NAME SLUG REGISTERED IN SKILLPRINT API";
    this.targetEnvironment = options.targetEnvironment || "production" /* PRODUCTION */;
    this.productionPartnerApiKey = options.productionPartnerApiKey || "";
    this.productionApiBaseUrl = options.productionApiBaseUrl || "https://api.skillprint.co/";
    this.stagingPartnerApiKey = options.stagingPartnerApiKey || "";
    this.stagingApiBaseUrl = options.stagingApiBaseUrl || "https://api.staging.skillprint.co/";
    this.gameParameters = options.gameParameters || [];
    this.screenshotIntervalSeconds = options.screenshotIntervalSeconds ?? 2;
    this.screenshotPostIntervalSeconds = options.screenshotPostIntervalSeconds ?? 5;
    this.pollResultsIntervalSeconds = options.pollResultsIntervalSeconds ?? 5;
    this.enableDebugLogging = options.enableDebugLogging ?? false;
  }
  /**
   * Resolves the active partner API key based on current targetEnvironment.
   */
  get activePartnerApiKey() {
    switch (this.targetEnvironment) {
      case "production" /* PRODUCTION */:
        return this.productionPartnerApiKey;
      case "staging" /* STAGING */:
        return this.stagingPartnerApiKey || this.productionPartnerApiKey;
      default:
        return this.productionPartnerApiKey;
    }
  }
  /**
   * Resolves the active API base URL based on current targetEnvironment.
   */
  get activeApiBaseUrl() {
    switch (this.targetEnvironment) {
      case "production" /* PRODUCTION */:
        return this.productionApiBaseUrl;
      case "staging" /* STAGING */:
        return this.stagingApiBaseUrl;
      default:
        return this.productionApiBaseUrl;
    }
  }
};

// src/parameter-definition.ts
var ParameterDefinition = class {
  constructor(options = {}) {
    this.updateAction = null;
    this.parameterName = options.parameterName || "";
    this.description = options.description || "";
    this.howSDKChangesIt = options.howSDKChangesIt || "";
    this.type = options.type || "Float" /* FLOAT */;
    this.minValue = options.minValue ?? 0;
    this.maxValue = options.maxValue ?? 100;
    this.defaultValue = options.defaultValue ?? "";
    this.updateAction = null;
  }
  /**
   * Checks if a converted value is valid for this parameter type and range.
   * @param value The value to validate
   */
  isValid(value) {
    switch (this.type) {
      case "Float" /* FLOAT */:
        return typeof value === "number" && !isNaN(value) && value >= this.minValue && value <= this.maxValue;
      case "Integer" /* INTEGER */:
        return typeof value === "number" && Number.isInteger(value) && value >= this.minValue && value <= this.maxValue;
      case "Boolean" /* BOOLEAN */:
        return typeof value === "boolean";
      default:
        return false;
    }
  }
  /**
   * Converts a raw API value into the defined type for this parameter.
   * @param rawValue Raw incoming value from API
   */
  convertValue(rawValue) {
    if (rawValue === null || rawValue === void 0) {
      return null;
    }
    try {
      switch (this.type) {
        case "Float" /* FLOAT */: {
          const parsedFloat = parseFloat(String(rawValue));
          return isNaN(parsedFloat) ? null : parsedFloat;
        }
        case "Integer" /* INTEGER */: {
          const parsedInt = parseInt(String(rawValue), 10);
          return isNaN(parsedInt) ? null : parsedInt;
        }
        case "Boolean" /* BOOLEAN */: {
          if (typeof rawValue === "boolean") return rawValue;
          if (typeof rawValue === "string") {
            const lower = rawValue.trim().toLowerCase();
            if (lower === "true" || lower === "1") return true;
            if (lower === "false" || lower === "0") return false;
          }
          return Boolean(rawValue);
        }
        default:
          return String(rawValue);
      }
    } catch (error) {
      console.error(`Error converting value for parameter ${this.parameterName}:`, error);
      return null;
    }
  }
};

// src/api-models.ts
var StartSessionRequest = class {
  constructor(sessionId, game, targetMood, gameParameters = [], deviceContext) {
    this.sessionId = sessionId;
    this.game = game;
    this.targetMood = targetMood;
    if (gameParameters.length > 0) this.gameParameters = gameParameters;
    if (deviceContext && Object.keys(deviceContext).length > 0) this.deviceContext = deviceContext;
  }
};
var TelemetryEventRequest = class {
  constructor(event, data = {}) {
    this.event = event;
    Object.assign(this, data);
  }
};
var ParameterInfo = class {
  constructor(name, type, description, minValue = null, maxValue = null, adjustmentGuide = "") {
    this.name = name;
    this.type = type;
    this.description = description;
    this.minValue = minValue;
    this.maxValue = maxValue;
    if (adjustmentGuide) this.adjustmentGuide = adjustmentGuide;
  }
};
var ParameterUpdateResult = class {
  constructor(data = {}) {
    this.parameterName = data.parameterName || "";
    this.newValue = data.newValue;
    this._rawJson = JSON.stringify(data);
    Object.keys(data).forEach((key) => {
      if (!(key in this)) {
        this[key] = data[key];
      }
    });
  }
  /**
   * Extracts parsed new value from response payload.
   */
  getParsedValue() {
    if (this.newValue !== null && this.newValue !== void 0 && this.newValue !== "") {
      return this.newValue;
    }
    if (this.parameterName && this[this.parameterName] !== void 0) {
      return this[this.parameterName];
    }
    return null;
  }
  /**
   * Converts value to target primitive type.
   * @param targetType Target primitive type string ('number', 'integer', 'boolean', 'string')
   */
  convertToType(targetType) {
    const value = this.getParsedValue();
    if (value === null || value === void 0) {
      return null;
    }
    try {
      switch (targetType.toLowerCase()) {
        case "number":
        case "float": {
          const val = Number(value);
          return isNaN(val) ? null : val;
        }
        case "integer": {
          const val = parseInt(String(value), 10);
          return isNaN(val) ? null : val;
        }
        case "boolean": {
          if (typeof value === "boolean") return value;
          if (typeof value === "string") {
            const lower = value.trim().toLowerCase();
            if (lower === "true" || lower === "1") return true;
            if (lower === "false" || lower === "0") return false;
          }
          return Boolean(value);
        }
        case "string":
          return String(value);
        default:
          return value;
      }
    } catch (error) {
      console.error(`Failed to convert value '${String(value)}' to type ${targetType}:`, error);
      return null;
    }
  }
  /**
   * Converts value based on parameter definition type and applies range clamping if necessary.
   * @param paramDef Parameter definition object
   */
  convertToParameterType(paramDef) {
    const rawValue = this.getParsedValue();
    if (rawValue === null || rawValue === void 0) {
      return null;
    }
    try {
      let convertedValue;
      switch (paramDef.type) {
        case "Float" /* FLOAT */:
          convertedValue = parseFloat(String(rawValue));
          if (isNaN(convertedValue)) return null;
          break;
        case "Integer" /* INTEGER */:
          convertedValue = parseInt(String(rawValue), 10);
          if (isNaN(convertedValue)) return null;
          break;
        case "Boolean" /* BOOLEAN */:
          if (typeof rawValue === "boolean") {
            convertedValue = rawValue;
          } else if (typeof rawValue === "string") {
            const lower = rawValue.trim().toLowerCase();
            convertedValue = lower === "true" || lower === "1";
          } else {
            convertedValue = Boolean(rawValue);
          }
          break;
        default:
          convertedValue = String(rawValue);
          break;
      }
      if (paramDef.isValid(convertedValue)) {
        return convertedValue;
      } else {
        console.warn(
          `Converted value ${String(convertedValue)} for parameter ${this.parameterName} is outside valid range [${paramDef.minValue}, ${paramDef.maxValue}]`
        );
        if (paramDef.type === "Float" /* FLOAT */ && typeof convertedValue === "number") {
          return Math.max(paramDef.minValue, Math.min(paramDef.maxValue, convertedValue));
        } else if (paramDef.type === "Integer" /* INTEGER */ && typeof convertedValue === "number") {
          return Math.max(Math.floor(paramDef.minValue), Math.min(Math.floor(paramDef.maxValue), convertedValue));
        }
        return convertedValue;
      }
    } catch (error) {
      console.error(`Error converting parameter ${this.parameterName}:`, error);
      return null;
    }
  }
};
var PollResultsResponse = class {
  constructor(data = {}) {
    this.gameplayTips = data.gameplayTips || "";
    this.state = data.state || "";
    this.parameterUpdates = (data.parameterUpdates || []).map((update) => new ParameterUpdateResult(update));
  }
};

// src/api-client.ts
var SkillprintApiError = class extends Error {
  constructor(status, body) {
    super(`${status} | ${body}`);
    this.name = "SkillprintApiError";
    this.status = status;
    this.body = body;
  }
};
var SkillprintAPIClient = class {
  /**
   * @param partnerApiKey The partner key sent as `Authorization: Api-Key`.
   *   Pass '' for host mode: a page on an origin the Skillprint API allows
   *   (such as the Skillprint portal) that signs its own players in. Calls
   *   then carry no key, and session calls send the player token from
   *   setPlayerToken() instead. createUser() and getUserToken() need a key.
   */
  constructor(baseUrl, partnerApiKey = "", logger) {
    // The player's short-lived auth token from the most recent startSession()
    // (null for an anonymous session), kept so logTelemetryEvent() can act on
    // the player's behalf: the backend only finds a player-owned session for
    // a request authenticated as that player.
    this.playerToken = null;
    this.playerId = null;
    // A token the host page already holds for its signed-in player, set with
    // setPlayerToken(). startSession() uses it when it gets no customPlayerId.
    this.hostPlayerToken = null;
    // API Endpoints
    this.START_SESSION_ENDPOINT = "/games/api/sessions/";
    this.UPLOAD_SCREENSHOTS_ENDPOINT = "/games/api/record-session/{sessionId}/";
    this.POLL_RESULTS_ENDPOINT = "/games/api/sessions/{sessionId}/";
    this.USER_PROFILE_ENDPOINT = "/scoring/api/profiles/";
    this.CREATE_USER_ENDPOINT = "/partners/api/users/add/";
    this.GET_USER_TOKEN_ENDPOINT = "/partners/api/users/auth/token/";
    this.ADD_TELEMETRY_ENDPOINT = "/games/api/sessions/telemetry";
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.partnerApiKey = partnerApiKey;
    this.logger = logger;
  }
  /**
   * Sets the auth token of a player the host page has already signed in,
   * e.g. after it refreshes an expired one. startSession() uses it when no
   * customPlayerId is given. Pass null to forget it.
   */
  setPlayerToken(token) {
    this.hostPlayerToken = token;
    this.playerToken = token;
    this.playerId = null;
  }
  /**
   * Headers for an API call. The partner key is sent whenever there is one.
   * The player token is sent when `withPlayerToken` is set; by default that
   * is only in host mode, where the token is the call's only credential.
   */
  headers(extra = {}, withPlayerToken = !this.partnerApiKey) {
    const headers = { ...extra };
    if (this.partnerApiKey) {
      headers["Authorization"] = `Api-Key ${this.partnerApiKey}`;
    }
    if (withPlayerToken && this.playerToken) {
      headers["X-Auth-Token"] = `Token ${this.playerToken}`;
    }
    return headers;
  }
  /**
   * Starts a new Skillprint session.
   * @param gameParameters Tunable parameters the backend provisions into the game's scoring config
   * @param options Optional session context, e.g. `deviceContext`
   */
  async startSession(sessionId, targetMood, customPlayerId = null, gameName = "", gameParameters = [], options = {}) {
    const url = `${this.baseUrl}${this.START_SESSION_ENDPOINT}`;
    this.logger?.(`Starting session: POST ${url}`, "info" /* INFO */);
    this.logger?.(`Starting session: MOOD ${targetMood}`, "warning" /* WARNING */);
    const validMoods = Object.values(Mood);
    if (!validMoods.includes(targetMood)) {
      const errorMessage = `Invalid targetMood: '${targetMood}'. Valid moods are: ${validMoods.join(", ")}.`;
      this.logger?.(errorMessage, "error" /* ERROR */);
      throw new Error(errorMessage);
    }
    let userToken = customPlayerId ? null : this.hostPlayerToken;
    if (customPlayerId) {
      try {
        userToken = await this.createOrGetUserToken(customPlayerId);
        this.logger?.(`User token obtained successfully for player: ${customPlayerId}`, "info" /* INFO */);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger?.(`Failed to obtain user token: ${message}`, "error" /* ERROR */);
        this.logger?.("Proceeding with session creation without user token", "warning" /* WARNING */);
      }
    }
    this.playerToken = userToken;
    this.playerId = userToken && customPlayerId ? customPlayerId : null;
    const requestData = new StartSessionRequest(
      sessionId,
      gameName,
      targetMood,
      gameParameters,
      options.deviceContext
    );
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: this.headers({ "Content-Type": "application/json" }, true),
        body: JSON.stringify(requestData)
      });
      const responseText = await response.text();
      if (response.ok) {
        this.logger?.(`StartSession successful. Response: ${responseText}`, "info" /* INFO */);
        return { success: true, data: responseText };
      } else {
        this.logger?.(`StartSession Error: ${response.status}. Response: ${responseText}`, "error" /* ERROR */);
        throw new SkillprintApiError(response.status, responseText);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger?.(`StartSession Error: ${message}`, "error" /* ERROR */);
      throw error;
    }
  }
  /**
   * Uploads a batch of captured screenshots for an active session.
   * `isLastChunk` tells the backend to score this batch and close the
   * session; with no screenshots it is a bare close signal.
   */
  async postScreenshots(sessionId, screenshots, isLastChunk = false, options = {}) {
    const endpoint = this.UPLOAD_SCREENSHOTS_ENDPOINT.replace("{sessionId}", sessionId);
    const url = `${this.baseUrl}${endpoint}`;
    this.logger?.(`Posting ${screenshots.length} screenshots (isLastChunk: ${isLastChunk}): POST ${url}`, "info" /* INFO */);
    const events = options.events || [];
    if (screenshots.length === 0 && !isLastChunk && events.length === 0) {
      const errorMsg = "No screenshots or events provided, and 'is_last_chunk' is false. Nothing to upload.";
      this.logger?.(errorMsg, "warning" /* WARNING */);
      throw new Error(errorMsg);
    }
    const formData = new FormData();
    formData.append("is_last_chunk", isLastChunk.toString().toLowerCase());
    for (let i = 0; i < screenshots.length; i++) {
      const screenshot = screenshots[i];
      if (screenshot) {
        const fieldName = `screenshot${i}`;
        const filename = `screenshot_${i}.jpg`;
        formData.append(fieldName, screenshot, filename);
      } else {
        this.logger?.(`Screenshot at index ${i} is null, skipping.`, "warning" /* WARNING */);
      }
    }
    (options.gameStates || []).forEach((state, i) => {
      if (state) {
        formData.append(`game_state${i}`, JSON.stringify(state));
      }
    });
    if (typeof options.inputCount === "number") {
      formData.append("input_count", String(options.inputCount));
    }
    (options.offsetsMs || []).forEach((offset, i) => {
      if (typeof offset === "number" && offset >= 0) {
        formData.append(`offset_ms${i}`, String(Math.round(offset)));
      }
    });
    if (options.events !== void 0) {
      formData.append("events", JSON.stringify(events));
    }
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: this.headers(),
        body: formData
      });
      const responseText = await response.text();
      if (response.ok) {
        this.logger?.(`PostScreenshots successful. Response: ${responseText}`, "info" /* INFO */);
        return { success: true, data: responseText };
      } else {
        this.logger?.(`PostScreenshots Error: ${response.status}. Response: ${responseText}`, "error" /* ERROR */);
        throw new SkillprintApiError(response.status, responseText);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger?.(`PostScreenshots Error: ${message}`, "error" /* ERROR */);
      throw error;
    }
  }
  /**
   * Appends a discrete telemetry event to an active session. Independent
   * of screenshot capture -- this posts to the same telemetry endpoint
   * the legacy games-repo convention uses, just invoked from the SDK
   * instead. The session must be OPEN.
   *
   * For a player's session, sends the player's token (X-Auth-Token) from
   * startSession(); if that short-lived token has expired (401), fetches a
   * fresh one once and retries.
   */
  async logTelemetryEvent(sessionId, gameSlug, event) {
    const url = `${this.baseUrl}${this.ADD_TELEMETRY_ENDPOINT}?session_id=${encodeURIComponent(sessionId)}&game_slug=${encodeURIComponent(gameSlug)}`;
    this.logger?.(`Logging telemetry event '${event.event}': POST ${url}`, "info" /* INFO */);
    const send = () => {
      return fetch(url, {
        method: "POST",
        headers: this.headers({ "Content-Type": "application/json" }, true),
        // The endpoint expects the actual event wrapped in an outer
        // {"event": ...} envelope -- confirmed against
        // games/tests/test_sessions.py in the marketplace repo, which
        // posts {"event": {"a": 1, "timestamp": ...}} and asserts
        // session.telemetry becomes [{"a": 1, "timestamp": ...}].
        // Sending `event` unwrapped would store the string
        // event.event ("LEVEL_START") as the whole telemetry entry.
        body: JSON.stringify({ event })
      });
    };
    try {
      let response = await send();
      if (response.status === 401 && this.playerId) {
        this.logger?.("Player token rejected (401); refreshing it and retrying once.", "warning" /* WARNING */);
        this.playerToken = await this.getUserToken(this.playerId);
        response = await send();
      }
      const responseText = await response.text();
      if (response.ok) {
        this.logger?.(`LogTelemetryEvent successful. Response: ${responseText}`, "info" /* INFO */);
        return { success: true, data: responseText };
      } else {
        this.logger?.(`LogTelemetryEvent Error: ${response.status}. Response: ${responseText}`, "error" /* ERROR */);
        throw new SkillprintApiError(response.status, responseText);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger?.(`LogTelemetryEvent Error: ${message}`, "error" /* ERROR */);
      throw error;
    }
  }
  /**
   * Fetches the session as the API reports it: its state, the skill and
   * mood scores so far, adjustments, tips and parameter updates.
   */
  async getSession(sessionId) {
    const endpoint = this.POLL_RESULTS_ENDPOINT.replace("{sessionId}", sessionId);
    return this.getJson(`${this.baseUrl}${endpoint}`, "GetSession");
  }
  /**
   * Polls API for updated parameter values for the active session.
   */
  async pollParameterResults(sessionId) {
    const pollResults = new PollResultsResponse(await this.getSession(sessionId));
    if (pollResults.parameterUpdates.length > 0) {
      this.logger?.(`Successfully parsed ${pollResults.parameterUpdates.length} parameter updates`, "info" /* INFO */);
      pollResults.parameterUpdates.forEach((update) => {
        const parsedValue = update.getParsedValue();
        this.logger?.(
          `Parameter Update: ${update.parameterName} = ${String(parsedValue)} (Type: ${typeof parsedValue})`,
          "info" /* INFO */
        );
      });
    } else {
      this.logger?.("No parameter updates found in response", "warning" /* WARNING */);
    }
    return { success: true, data: pollResults.parameterUpdates };
  }
  /**
   * Fetches the signed-in player's skill profile. Needs a player token.
   */
  async getUserProfile() {
    return this.getJson(`${this.baseUrl}${this.USER_PROFILE_ENDPOINT}`, "GetUserProfile", true);
  }
  async getJson(url, label, withPlayerToken) {
    this.logger?.(`${label}: GET ${url}`, "info" /* INFO */);
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: this.headers({ "Accept": "application/json" }, withPlayerToken)
      });
      const responseText = await response.text();
      if (!response.ok) {
        this.logger?.(`${label} Error: ${response.status}. Response: ${responseText}`, "error" /* ERROR */);
        throw new SkillprintApiError(response.status, responseText);
      }
      this.logger?.(`${label} successful. Response: ${responseText}`, "info" /* INFO */);
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        const message = parseError instanceof Error ? parseError.message : String(parseError);
        this.logger?.(`${label} JSON parsing error: ${message}. Response: ${responseText}`, "error" /* ERROR */);
        throw parseError;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger?.(`${label} Error: ${message}`, "error" /* ERROR */);
      throw error;
    }
  }
  /**
   * Creates or fetches user auth token for custom player ID.
   */
  async createOrGetUserToken(customPlayerId) {
    if (!customPlayerId) {
      throw new Error("Custom player ID cannot be null or empty");
    }
    try {
      return await this.getUserToken(customPlayerId);
    } catch {
      try {
        await this.createUser(customPlayerId);
        return await this.getUserToken(customPlayerId);
      } catch (createError) {
        const message = createError instanceof Error ? createError.message : String(createError);
        throw new Error(`Failed to create user: ${message}`);
      }
    }
  }
  /**
   * Registers a new user with Skillprint API.
   */
  async createUser(internalId) {
    const url = `${this.baseUrl}${this.CREATE_USER_ENDPOINT}`;
    this.logger?.(`Creating user: POST ${url} with internalId: ${internalId}`, "info" /* INFO */);
    const response = await fetch(url, {
      method: "POST",
      headers: this.headers({ "Content-Type": "application/json" }, false),
      body: JSON.stringify({ internalId })
    });
    const responseText = await response.text();
    if (response.ok) {
      this.logger?.(`CreateUser successful. Response: ${responseText}`, "info" /* INFO */);
      return responseText;
    } else {
      this.logger?.(`CreateUser Error: ${response.status}. Response: ${responseText}`, "error" /* ERROR */);
      throw new SkillprintApiError(response.status, responseText);
    }
  }
  /**
   * Obtains auth token for existing user internalId.
   */
  async getUserToken(internalId) {
    const url = `${this.baseUrl}${this.GET_USER_TOKEN_ENDPOINT}`;
    this.logger?.(`Getting user token: POST ${url} with internalId: ${internalId}`, "info" /* INFO */);
    const response = await fetch(url, {
      method: "POST",
      headers: this.headers({ "Content-Type": "application/json" }, false),
      body: JSON.stringify({ internalId })
    });
    const responseText = await response.text();
    if (response.ok) {
      this.logger?.(`GetUserToken successful. Response: ${responseText}`, "info" /* INFO */);
      try {
        const tokenResponse = JSON.parse(responseText);
        if (tokenResponse.token) {
          return tokenResponse.token;
        } else {
          throw new Error("Token not found in response");
        }
      } catch (parseError) {
        const message = parseError instanceof Error ? parseError.message : String(parseError);
        this.logger?.(`Failed to parse token response: ${message}`, "error" /* ERROR */);
        throw new Error("Failed to parse token response");
      }
    } else {
      this.logger?.(`GetUserToken Error: ${response.status}. Response: ${responseText}`, "error" /* ERROR */);
      throw new SkillprintApiError(response.status, responseText);
    }
  }
};

// src/screenshot-utility.ts
var ScreenshotUtility = class {
  constructor(logger) {
    this.logger = logger;
  }
  /**
   * Captures a screenshot from a standard HTML canvas element as a Blob.
   * @param canvas Target HTML Canvas element
   * @param options Screenshot options (format, quality, max dimensions)
   */
  async captureScreenshot(canvas, options = {}) {
    try {
      const {
        format = "image/jpeg",
        quality = 0.8,
        maxWidth = null,
        maxHeight = null
      } = options;
      if (!canvas) {
        throw new Error("No canvas provided for screenshot");
      }
      const screenshotCanvas = document.createElement("canvas");
      const ctx = screenshotCanvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to obtain 2D rendering context for screenshot canvas");
      }
      let targetWidth = canvas.width;
      let targetHeight = canvas.height;
      if (targetWidth === 0 || targetHeight === 0) {
        throw new Error("Canvas has 0 width or height");
      }
      if (maxWidth && targetWidth > maxWidth) {
        const scale = maxWidth / targetWidth;
        targetWidth = maxWidth;
        targetHeight = Math.floor(targetHeight * scale);
      }
      if (maxHeight && targetHeight > maxHeight) {
        const scale = maxHeight / targetHeight;
        targetHeight = maxHeight;
        targetWidth = Math.floor(targetWidth * scale);
      }
      screenshotCanvas.width = targetWidth;
      screenshotCanvas.height = targetHeight;
      ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
      return new Promise((resolve) => {
        screenshotCanvas.toBlob(
          (blob) => {
            if (blob) {
              this.logger?.("Screenshot captured successfully", "info" /* INFO */);
              resolve(blob);
            } else {
              this.logger?.("Failed to create screenshot blob", "error" /* ERROR */);
              resolve(null);
            }
          },
          format,
          quality
        );
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger?.(`Error capturing screenshot: ${message}`, "error" /* ERROR */);
      return null;
    }
  }
  /**
   * Alternative method for WebGL contexts that don't preserve drawing buffer.
   * Reads pixel data directly from WebGL rendering context and flips vertically.
   * @param gl WebGL rendering context (WebGLRenderingContext | WebGL2RenderingContext)
   * @param canvas Target HTML Canvas element
   * @param options Screenshot options
   */
  async captureScreenshotWebGL(gl, canvas, options = {}) {
    try {
      const { format = "image/jpeg", quality = 0.8 } = options;
      if (!gl || !canvas) {
        throw new Error("Invalid WebGL context or canvas provided");
      }
      const pixels = new Uint8Array(canvas.width * canvas.height * 4);
      gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const ctx = tempCanvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2d context for WebGL screenshot processing");
      }
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const srcIndex = (y * canvas.width + x) * 4;
          const dstIndex = ((canvas.height - 1 - y) * canvas.width + x) * 4;
          imageData.data[dstIndex] = pixels[srcIndex];
          imageData.data[dstIndex + 1] = pixels[srcIndex + 1];
          imageData.data[dstIndex + 2] = pixels[srcIndex + 2];
          imageData.data[dstIndex + 3] = pixels[srcIndex + 3];
        }
      }
      ctx.putImageData(imageData, 0, 0);
      return new Promise((resolve) => {
        tempCanvas.toBlob(
          (blob) => {
            if (blob) {
              this.logger?.("WebGL screenshot captured successfully", "info" /* INFO */);
              resolve(blob);
            } else {
              this.logger?.("Failed to create WebGL screenshot blob", "error" /* ERROR */);
              resolve(null);
            }
          },
          format,
          quality
        );
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger?.(`Error capturing WebGL screenshot: ${message}`, "error" /* ERROR */);
      return null;
    }
  }
};

// src/session-timeline.ts
var MAX_EVENTS_PER_UPLOAD = 1e3;
var defaultNow = () => typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : Date.now();
var SessionTimeline = class {
  /**
   * @param now Clock in milliseconds; defaults to `performance.now()`
   * @param maxQueued Events kept while waiting for an upload; later ones are dropped
   */
  constructor(now = defaultNow, maxQueued = 5e3) {
    this.startedAt = null;
    this.queue = [];
    this.recordedAny = false;
    this.now = now;
    this.maxQueued = maxQueued;
  }
  /** Starts the clock at 0 and empties the queue. */
  start() {
    this.startedAt = this.now();
    this.queue = [];
    this.recordedAny = false;
  }
  /** Stops the clock and empties the queue. */
  reset() {
    this.startedAt = null;
    this.queue = [];
    this.recordedAny = false;
  }
  get isStarted() {
    return this.startedAt !== null;
  }
  /**
   * Whole milliseconds from `start()` to `at` (default: now); 0 before
   * the start, or for a time earlier than it.
   */
  offsetMs(at) {
    if (this.startedAt === null) return 0;
    const when = typeof at === "number" && Number.isFinite(at) ? at : this.now();
    return Math.max(0, Math.round(when - this.startedAt));
  }
  /**
   * Stamps an event with the current offset and queues it.
   * Returns the queued event, or null when the queue is full.
   *
   * `event` is a `GameEvent` for the universal vocabulary, or the game's
   * own name for a game-specific event (e.g. 'ROTATE_CLOCKWISE'). `data`
   * is merged in; it can't override `event` or `timestamp`. `at` is when
   * it happened, on this timeline's clock (default: now).
   */
  record(event, data = {}, at) {
    if (this.queue.length >= this.maxQueued) return null;
    const entry = { ...data, event, timestamp: this.offsetMs(at) };
    this.queue.push(entry);
    this.recordedAny = true;
    return entry;
  }
  get pendingEvents() {
    return this.queue.length;
  }
  /** True once this session has recorded any event. */
  get hasRecorded() {
    return this.recordedAny;
  }
  /** Removes and returns the earliest queued events, at most `max`, in session-time order. */
  takeEvents(max = MAX_EVENTS_PER_UPLOAD) {
    this.sortQueue();
    return this.queue.splice(0, max);
  }
  /**
   * Removes and returns the queued events logged up to `offsetMs`
   * (inclusive), at most `max`, in session-time order. Later ones stay
   * queued for the upload that carries the screenshots after them.
   */
  takeEventsThrough(offsetMs, max = MAX_EVENTS_PER_UPLOAD) {
    this.sortQueue();
    let n = 0;
    while (n < this.queue.length && n < max && this.queue[n].timestamp <= offsetMs) n++;
    return this.queue.splice(0, n);
  }
  /**
   * The `events` for an upload whose last screenshot was taken at
   * `lastFrameOffsetMs`: the events logged up to then, or every queued
   * event for the closing upload (pass null). An empty list once the
   * session has recorded any event, so the server can tell a quiet stretch
   * from a game that doesn't log events; undefined before that.
   */
  eventsForUpload(lastFrameOffsetMs) {
    if (!this.recordedAny) return void 0;
    return lastFrameOffsetMs === null ? this.takeEvents() : this.takeEventsThrough(lastFrameOffsetMs);
  }
  // Events stamped with `at` can arrive out of order; uploads send them in order.
  sortQueue() {
    this.queue.sort((a, b) => a.timestamp - b.timestamp);
  }
  /** Puts events back at the front of the queue, e.g. after a failed upload. */
  requeue(events) {
    const room = Math.max(0, this.maxQueued - this.queue.length);
    this.queue.unshift(...events.slice(0, room));
  }
};

// src/url-parameter-extractor.ts
var WebGLUrlParameterExtractor = class {
  /**
   * Retrieves a URL query parameter by key.
   * @param parameterName Name of the URL query parameter
   */
  static getUrlParameter(parameterName) {
    try {
      if (!this.isUrlParameterSupported()) return null;
      const url = new URL(window.location.href);
      return url.searchParams.get(parameterName);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Failed to get URL parameter '${parameterName}': ${message}`);
      return null;
    }
  }
  /**
   * Gets current window URL string.
   */
  static getCurrentUrl() {
    try {
      if (!this.isUrlParameterSupported()) return null;
      return window.location.href;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`Failed to get current URL: ${message}`);
      return null;
    }
  }
  /**
   * Extracts targetMood and playerId from URL query parameters.
   */
  static getSkillprintUrlParameters() {
    const targetMood = this.getUrlParameter("mood") || this.getUrlParameter("targetMood");
    const playerId = this.getUrlParameter("playerId") || this.getUrlParameter("player_id") || this.getUrlParameter("userId");
    if (typeof window !== "undefined" && window.localStorage) {
      if (targetMood) {
        try {
          localStorage.setItem("SkillprintMood", targetMood);
        } catch {
        }
      }
      if (playerId) {
        try {
          localStorage.setItem("SkillprintPlayerId", playerId);
        } catch {
        }
      }
    }
    return { targetMood, playerId };
  }
  /**
   * Returns true if running in browser context with URL access.
   */
  static isUrlParameterSupported() {
    return typeof window !== "undefined" && typeof window.location !== "undefined";
  }
};
var SkillprintSessionHelper = class {
  /**
   * Starts a Skillprint session, attempting to auto-extract parameters from URL.
   * @param manager SkillprintManager instance
   * @param fallbackMood Mood to use if not found in URL
   * @param fallbackPlayerId Player ID to use if not found in URL
   * @param overrideMood Forced mood override
   * @param overridePlayerId Forced player ID override
   */
  static startSessionWithUrlParams(manager, fallbackMood = "focus" /* FOCUS */, fallbackPlayerId = null, overrideMood = null, overridePlayerId = null) {
    if (!manager) {
      console.error("SkillprintManager is null. Cannot start session.");
      return;
    }
    let targetMood = overrideMood;
    let playerId = overridePlayerId;
    if (!targetMood || !playerId) {
      if (WebGLUrlParameterExtractor.isUrlParameterSupported()) {
        const urlParams = WebGLUrlParameterExtractor.getSkillprintUrlParameters();
        if (!targetMood) {
          targetMood = urlParams.targetMood || fallbackMood;
        }
        if (!playerId) {
          playerId = urlParams.playerId || fallbackPlayerId;
        }
        manager.log(`URL Parameters - Mood: '${targetMood}', Player ID: '${playerId}'`, "info" /* INFO */);
      } else {
        if (!targetMood) targetMood = fallbackMood;
        if (!playerId) playerId = fallbackPlayerId;
        manager.log(
          `Non-browser Platform - Using fallback values. Mood: '${targetMood}', Player ID: '${playerId}'`,
          "info" /* INFO */
        );
      }
    }
    if (!targetMood) {
      manager.log("No target mood specified and no fallback provided. Using 'focus' as default.", "warning" /* WARNING */);
      targetMood = "focus" /* FOCUS */;
    }
    const validMoods = Object.values(Mood);
    if (!validMoods.includes(targetMood)) {
      manager.log(
        `Invalid mood '${targetMood}'. Valid moods: ${validMoods.join(", ")}. Using 'focus' as fallback.`,
        "warning" /* WARNING */
      );
      targetMood = "focus" /* FOCUS */;
    }
    manager.log(
      `Starting Skillprint session with Mood: '${targetMood}', Player ID: '${playerId || "none"}'`,
      "info" /* INFO */
    );
    manager.startGameSession(targetMood, playerId);
  }
};

// src/manager.ts
var _SkillprintManager = class _SkillprintManager {
  constructor(config, canvasProvider) {
    this.currentSessionId = null;
    this.isSessionActive = false;
    this.apiClient = null;
    this.screenshotUtility = null;
    this.screenshotQueue = [];
    /** The session's clock and its queue of events waiting for an upload. */
    this.timeline = new SessionTimeline();
    this.registeredParameters = /* @__PURE__ */ new Map();
    // Timers
    this.screenshotCaptureTimer = null;
    this.screenshotPostTimer = null;
    this.pollResultsTimer = null;
    // The post loop's in-flight upload, if any, so stopGameSession() can let
    // it land before sending the final is_last_chunk batch.
    this.inFlightPost = null;
    if (_SkillprintManager.instance) {
      console.warn("Another instance of SkillprintManager already exists. Using existing instance.");
      return _SkillprintManager.instance;
    }
    this.config = config;
    this.canvasProvider = canvasProvider;
    this.currentSessionId = null;
    this.isSessionActive = false;
    this.apiClient = null;
    this.screenshotUtility = null;
    this.screenshotQueue = [];
    this.timeline = new SessionTimeline();
    this.registeredParameters = /* @__PURE__ */ new Map();
    this.initializeSDK();
    _SkillprintManager.instance = this;
  }
  static getInstance() {
    return _SkillprintManager.instance;
  }
  initializeSDK() {
    if (!this.config) {
      console.error("SkillprintConfig not provided to SkillprintManager. SDK will not function.");
      return;
    }
    if (!this.config.activePartnerApiKey) {
      this.log(
        `Partner API Key for ${this.config.targetEnvironment} environment is not set. SDK will not function.`,
        "error" /* ERROR */
      );
      return;
    }
    if (!this.config.activeApiBaseUrl) {
      this.log(
        `API Base URL for ${this.config.targetEnvironment} environment is not set. SDK will not function.`,
        "error" /* ERROR */
      );
      return;
    }
    this.apiClient = new SkillprintAPIClient(
      this.config.activeApiBaseUrl,
      this.config.activePartnerApiKey,
      this.log.bind(this)
    );
    this.screenshotUtility = new ScreenshotUtility(this.log.bind(this));
    this.config.gameParameters.forEach((paramDefOptions) => {
      const paramDef = new ParameterDefinition(paramDefOptions);
      if (!this.registeredParameters.has(paramDef.parameterName)) {
        this.registeredParameters.set(paramDef.parameterName, paramDef);
      } else {
        this.log(
          `Duplicate parameter name found in config: ${paramDef.parameterName}. Using first occurrence.`,
          "warning" /* WARNING */
        );
      }
    });
    this.log(
      `Skillprint SDK Initialized for ${this.config.targetEnvironment} environment (URL: ${this.config.activeApiBaseUrl}).`
    );
  }
  /**
   * Registers a modifier callback action for a named parameter.
   * @param parameterName Unique parameter identifier
   * @param updateAction Callback invoked when Skillprint modifies this parameter
   * @param expectedType Optional type check string ('number', 'integer', 'boolean')
   */
  registerParameterModifier(parameterName, updateAction, expectedType = null) {
    const paramDef = this.registeredParameters.get(parameterName);
    if (paramDef) {
      if (expectedType) {
        let typeMatch = false;
        if (expectedType === "number" && paramDef.type === "Float" /* FLOAT */) typeMatch = true;
        else if (expectedType === "integer" && paramDef.type === "Integer" /* INTEGER */) typeMatch = true;
        else if (expectedType === "boolean" && paramDef.type === "Boolean" /* BOOLEAN */) typeMatch = true;
        if (!typeMatch) {
          this.log(
            `Type mismatch for parameter '${parameterName}'. Expected ${paramDef.type}, but got ${expectedType}. Modifier not registered.`,
            "error" /* ERROR */
          );
          return;
        }
      }
      paramDef.updateAction = (value) => {
        try {
          updateAction(value);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          this.log(`Error in update action for parameter '${parameterName}': ${message}`, "error" /* ERROR */);
        }
      };
      this.log(`Parameter '${parameterName}' modifier registered successfully.`);
    } else {
      this.log(
        `Attempted to register modifier for undefined parameter: '${parameterName}'. Ensure it's in SkillprintConfig.`,
        "warning" /* WARNING */
      );
    }
  }
  /**
   * Starts a new Skillprint AI gameplay session.
   * @param targetMood Target optimization mood category
   * @param customPlayerId Optional external player identifier
   */
  async startGameSession(targetMood, customPlayerId = null) {
    if (this.isSessionActive) {
      this.log("Session already active. Call stopGameSession first.", "warning" /* WARNING */);
      return;
    }
    if (!this.config || !this.config.activePartnerApiKey || !this.config.activeApiBaseUrl || !this.apiClient) {
      this.log("SDK not configured properly (check environment settings). Cannot start session.", "error" /* ERROR */);
      return;
    }
    this.currentSessionId = this.generateSessionId();
    this.isSessionActive = true;
    this.timeline.start();
    this.log(`Starting game session for ${this.config.targetEnvironment} environment.`, "info" /* INFO */);
    const parameterInfos = Array.from(this.registeredParameters.values()).map(
      (p) => new ParameterInfo(
        p.parameterName,
        String(p.type),
        p.description,
        p.type === "Float" /* FLOAT */ || p.type === "Integer" /* INTEGER */ ? p.minValue.toString() : null,
        p.type === "Float" /* FLOAT */ || p.type === "Integer" /* INTEGER */ ? p.maxValue.toString() : null,
        p.howSDKChangesIt
      )
    );
    try {
      const result = await this.apiClient.startSession(
        this.currentSessionId,
        targetMood,
        customPlayerId,
        this.config.gameName,
        parameterInfos
      );
      this.log(`Skillprint session started: ${this.currentSessionId}. Response: ${result.data}`);
      this.startScreenshotCaptureLoop();
      this.startScreenshotPostLoop();
      this.startPollResultsLoop();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.log(`Failed to start Skillprint session: ${message}`, "error" /* ERROR */);
      this.isSessionActive = false;
      this.currentSessionId = null;
      this.timeline.reset();
    }
  }
  /**
   * Stops the active Skillprint session: halts capture/post/poll loops,
   * then uploads any still-queued screenshots with the final batch marked
   * `is_last_chunk=true`, which tells the backend to score the last chunk
   * and close the session. With an empty queue it sends the bare
   * `is_last_chunk=true` close signal instead.
   *
   * Local state is reset synchronously, so a new session can start right
   * away; the returned promise resolves once the final upload settles.
   * Never rejects -- upload failures are logged, not thrown.
   */
  async stopGameSession() {
    if (!this.isSessionActive) {
      this.log("No active session to stop.", "warning" /* WARNING */);
      return;
    }
    const sessionId = this.currentSessionId;
    const remaining = this.screenshotQueue;
    const recorded = this.timeline.hasRecorded;
    const events = this.timeline.takeEvents(Number.MAX_SAFE_INTEGER);
    const inFlightPost = this.inFlightPost;
    const apiClient = this.apiClient;
    this.log(`Stopping Skillprint session: ${sessionId}`);
    this.isSessionActive = false;
    if (this.screenshotCaptureTimer) clearInterval(this.screenshotCaptureTimer);
    if (this.screenshotPostTimer) clearInterval(this.screenshotPostTimer);
    if (this.pollResultsTimer) clearInterval(this.pollResultsTimer);
    this.screenshotCaptureTimer = null;
    this.screenshotPostTimer = null;
    this.pollResultsTimer = null;
    this.screenshotQueue = [];
    this.currentSessionId = null;
    this.inFlightPost = null;
    this.timeline.reset();
    if (!sessionId || !apiClient) {
      this.log("Skillprint session stopped.");
      return;
    }
    if (inFlightPost) await inFlightPost;
    const batchSize = this.postBatchSize();
    try {
      const eventsUpTo = (lastFrameOffsetMs) => {
        if (!recorded) return void 0;
        const n = lastFrameOffsetMs === null ? events.length : events.findIndex((e) => e.timestamp > lastFrameOffsetMs);
        return events.splice(0, Math.min(n === -1 ? events.length : n, MAX_EVENTS_PER_UPLOAD));
      };
      if (remaining.length === 0) {
        while (events.length > MAX_EVENTS_PER_UPLOAD) {
          await apiClient.postScreenshots(sessionId, [], false, { events: events.splice(0, MAX_EVENTS_PER_UPLOAD) });
        }
        await apiClient.postScreenshots(sessionId, [], true, { events: eventsUpTo(null) });
      } else {
        for (let i = 0; i < remaining.length; i += batchSize) {
          const batch = remaining.slice(i, i + batchSize);
          const isLastChunk = i + batchSize >= remaining.length;
          if (isLastChunk) {
            while (events.length > MAX_EVENTS_PER_UPLOAD) {
              await apiClient.postScreenshots(sessionId, [], false, { events: events.splice(0, MAX_EVENTS_PER_UPLOAD) });
            }
          }
          const lastOffset = Math.max(...batch.map((s) => s.offsetMs));
          await apiClient.postScreenshots(sessionId, batch.map((s) => s.blob), isLastChunk, {
            offsetsMs: batch.map((s) => s.offsetMs),
            events: eventsUpTo(isLastChunk ? null : lastOffset)
          });
        }
      }
      const flushed = remaining.length;
      this.log(`Skillprint session stopped. Flushed ${flushed} queued screenshots.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.log(`Failed to flush screenshots on session stop: ${message}`, "error" /* ERROR */);
    }
  }
  /**
   * Logs a discrete gameplay event for the active session: a universal
   * `GameEvent`, or the game's own name for a game-specific event (e.g.
   * 'ROTATE_CLOCKWISE'). It is stamped with the milliseconds since the
   * session started and sent with the next screenshot upload (or on its own
   * when there is no screenshot to send), and the rest go with the closing
   * upload on stopGameSession().
   *
   * Never throws; with no active session it is ignored with a warning.
   */
  async logEvent(event, data = {}) {
    if (!this.isSessionActive || !this.currentSessionId || !this.apiClient) {
      this.log("logEvent called with no active session. Ignoring.", "warning" /* WARNING */);
      return;
    }
    if (!this.timeline.record(event, data)) {
      this.log(`Event queue full. Dropping '${event}'.`, "warning" /* WARNING */);
    }
  }
  startScreenshotCaptureLoop() {
    this.screenshotCaptureTimer = setInterval(async () => {
      if (!this.isSessionActive || !this.screenshotUtility) return;
      const canvas = this.canvasProvider?.();
      if (!canvas) {
        this.log("No canvas available for screenshot capture", "warning" /* WARNING */);
        return;
      }
      const sessionId = this.currentSessionId;
      const offsetMs = this.timeline.offsetMs();
      const screenshot = await this.screenshotUtility.captureScreenshot(canvas);
      if (!this.isSessionActive || this.currentSessionId !== sessionId) return;
      if (screenshot) {
        if (this.screenshotQueue.length < 50) {
          this.screenshotQueue.push({ blob: screenshot, offsetMs });
          this.log(`Screenshot captured. Queue size: ${this.screenshotQueue.length}`);
        } else {
          this.log("Screenshot queue full. Discarding new screenshot.", "warning" /* WARNING */);
        }
      }
    }, this.config.screenshotIntervalSeconds * 1e3);
  }
  startScreenshotPostLoop() {
    this.screenshotPostTimer = setInterval(async () => {
      if (!this.isSessionActive || !this.apiClient || !this.currentSessionId) return;
      if (this.screenshotQueue.length === 0 && this.timeline.pendingEvents <= MAX_EVENTS_PER_UPLOAD) return;
      const batch = this.screenshotQueue.splice(0, Math.min(this.screenshotQueue.length, this.postBatchSize()));
      const events = batch.length > 0 ? this.timeline.eventsForUpload(Math.max(...batch.map((s) => s.offsetMs))) : this.timeline.takeEvents();
      const apiClient = this.apiClient;
      const sessionId = this.currentSessionId;
      this.log(`Posting ${batch.length} screenshots and ${events?.length ?? 0} events...`);
      const post = (async () => {
        try {
          const result = await apiClient.postScreenshots(sessionId, batch.map((s) => s.blob), false, {
            offsetsMs: batch.map((s) => s.offsetMs),
            events
          });
          this.log(`Successfully posted ${batch.length} screenshots and ${events?.length ?? 0} events. Response: ${result.data}`);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          this.log(`Failed to post screenshots: ${message}`, "error" /* ERROR */);
          this.requeueEvents(events ?? [], error, sessionId);
        }
      })();
      this.inFlightPost = post;
      await post;
      if (this.inFlightPost === post) this.inFlightPost = null;
    }, this.config.screenshotPostIntervalSeconds * 1e3);
  }
  /**
   * Keeps events from an upload that may succeed if tried again (a network
   * error or a 5xx), so the next upload carries them. A 4xx would fail the
   * same way again, so those are dropped.
   */
  requeueEvents(events, error, sessionId) {
    if (events.length === 0 || !this.isSessionActive || this.currentSessionId !== sessionId) return;
    if (error instanceof SkillprintApiError && error.status < 500) return;
    this.timeline.requeue(events);
  }
  postBatchSize() {
    return Math.max(
      1,
      Math.ceil(this.config.screenshotPostIntervalSeconds / this.config.screenshotIntervalSeconds) * 2
    );
  }
  startPollResultsLoop() {
    this.pollResultsTimer = setInterval(async () => {
      if (!this.isSessionActive || !this.apiClient || !this.currentSessionId) return;
      try {
        const result = await this.apiClient.pollParameterResults(this.currentSessionId);
        if (result.success && result.data && result.data.length > 0) {
          this.log(`Received ${result.data.length} parameter updates from API.`);
          this.applyParameterUpdates(result.data);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.log(`Failed to poll results: ${message}`, "warning" /* WARNING */);
      }
    }, this.config.pollResultsIntervalSeconds * 1e3);
  }
  applyParameterUpdates(updates) {
    updates.forEach((update) => {
      const parsed = update.getParsedValue();
      this.log(
        `[DEBUG] Received update - Name: ${update.parameterName}, Value: '${String(parsed)}', Type: ${typeof parsed}`,
        "info" /* INFO */
      );
      const paramDef = this.registeredParameters.get(update.parameterName);
      if (paramDef) {
        if (!paramDef.updateAction) {
          this.log(
            `Parameter '${update.parameterName}' received from API but has no registered modifier. Skipping.`,
            "warning" /* WARNING */
          );
          return;
        }
        const convertedValue = update.convertToParameterType(paramDef);
        if (convertedValue !== null && paramDef.isValid(convertedValue)) {
          try {
            this.log(`Applying update: ${paramDef.parameterName} = ${String(convertedValue)} (Type: ${String(paramDef.type)})`);
            paramDef.updateAction(convertedValue);
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.log(`Error applying update for ${paramDef.parameterName}: ${message}`, "error" /* ERROR */);
          }
        } else {
          this.log(
            `Invalid value or type for parameter ${paramDef.parameterName}: '${String(update.newValue)}'. Expected type: ${String(paramDef.type)}, Range: ${paramDef.minValue}-${paramDef.maxValue}. Skipping.`,
            "warning" /* WARNING */
          );
        }
      } else {
        this.log(`Received update for unknown parameter: ${update.parameterName}. Skipping.`, "warning" /* WARNING */);
      }
    });
  }
  generateSessionId() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  }
  log(message, level = "info" /* INFO */) {
    if (!this.config.enableDebugLogging && level === "info" /* INFO */) return;
    const prefix = "[SkillprintSDK]";
    switch (level) {
      case "info" /* INFO */:
        console.log(`${prefix} ${message}`);
        break;
      case "warning" /* WARNING */:
        console.warn(`${prefix} ${message}`);
        break;
      case "error" /* ERROR */:
        console.error(`${prefix} ${message}`);
        break;
    }
  }
  getCurrentSessionId() {
    return this.currentSessionId;
  }
  getConfig() {
    return this.config;
  }
  // WebGL convenience methods
  startGameSessionFromUrl(fallbackMood = "relax" /* RELAX */, fallbackPlayerId = null) {
    SkillprintSessionHelper.startSessionWithUrlParams(this, fallbackMood, fallbackPlayerId);
  }
  startGameSessionWithOverrides(fallbackMood = "relax" /* RELAX */, fallbackPlayerId = null, overrideMood = null, overridePlayerId = null) {
    SkillprintSessionHelper.startSessionWithUrlParams(
      this,
      fallbackMood,
      fallbackPlayerId,
      overrideMood,
      overridePlayerId
    );
  }
  getUrlParametersInfo() {
    if (!WebGLUrlParameterExtractor.isUrlParameterSupported()) {
      return "URL parameters not supported on this platform (not in browser)";
    }
    const currentUrl = WebGLUrlParameterExtractor.getCurrentUrl();
    const urlParams = WebGLUrlParameterExtractor.getSkillprintUrlParameters();
    return `Current URL: ${currentUrl}
Mood Parameter: '${urlParams.targetMood || "not found"}'
Player ID Parameter: '${urlParams.playerId || "not found"}'`;
  }
};
_SkillprintManager.instance = null;
var SkillprintManager = _SkillprintManager;

// src/adapters/phaser.ts
var PhaserSkillprintAdapter = class _PhaserSkillprintAdapter {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.manager = new SkillprintManager(config, () => this.scene.game.canvas);
  }
  static create(scene, config) {
    return new _PhaserSkillprintAdapter(scene, config);
  }
  startSession(targetMood, customPlayerId = null) {
    return this.manager.startGameSession(targetMood, customPlayerId);
  }
  stopSession() {
    return this.manager.stopGameSession();
  }
  logEvent(event, data) {
    return this.manager.logEvent(event, data);
  }
  registerParameter(parameterName, updateAction, expectedType = null) {
    this.manager.registerParameterModifier(parameterName, updateAction, expectedType);
  }
  /**
   * Phaser-specific helper to register sprite property updates directly.
   */
  registerSpriteProperty(parameterName, sprite, propertyName) {
    this.manager.registerParameterModifier(parameterName, (value) => {
      sprite[propertyName] = value;
    });
  }
};

// src/adapters/three.ts
var ThreeSkillprintAdapter = class _ThreeSkillprintAdapter {
  constructor(renderer, config) {
    this.renderer = renderer;
    this.config = config;
    this.manager = new SkillprintManager(config, () => this.renderer.domElement);
  }
  static create(renderer, config) {
    return new _ThreeSkillprintAdapter(renderer, config);
  }
  startSession(targetMood, customPlayerId = null) {
    return this.manager.startGameSession(targetMood, customPlayerId);
  }
  stopSession() {
    return this.manager.stopGameSession();
  }
  logEvent(event, data) {
    return this.manager.logEvent(event, data);
  }
  registerParameter(parameterName, updateAction, expectedType = null) {
    this.manager.registerParameterModifier(parameterName, updateAction, expectedType);
  }
  /**
   * Three.js-specific helper to register object or nested material property updates.
   */
  registerObjectProperty(parameterName, object, propertyName) {
    this.manager.registerParameterModifier(parameterName, (value) => {
      if (propertyName.includes(".")) {
        const props = propertyName.split(".");
        let target = object;
        for (let i = 0; i < props.length - 1; i++) {
          target = target[props[i]];
        }
        target[props[props.length - 1]] = value;
      } else {
        object[propertyName] = value;
      }
    });
  }
};

// src/adapters/pixi.ts
var PixiSkillprintAdapter = class _PixiSkillprintAdapter {
  constructor(app, config) {
    this.app = app;
    this.config = config;
    this.manager = new SkillprintManager(config, () => this.app.view || this.app.canvas || null);
  }
  static create(app, config) {
    return new _PixiSkillprintAdapter(app, config);
  }
  startSession(targetMood, customPlayerId = null) {
    return this.manager.startGameSession(targetMood, customPlayerId);
  }
  stopSession() {
    return this.manager.stopGameSession();
  }
  logEvent(event, data) {
    return this.manager.logEvent(event, data);
  }
  registerParameter(parameterName, updateAction, expectedType = null) {
    this.manager.registerParameterModifier(parameterName, updateAction, expectedType);
  }
  /**
   * PixiJS-specific helper to register display object property updates.
   */
  registerDisplayObjectProperty(parameterName, displayObject, propertyName) {
    this.manager.registerParameterModifier(parameterName, (value) => {
      displayObject[propertyName] = value;
    });
  }
};

// src/adapters/canvas.ts
var GenericCanvasSkillprintAdapter = class _GenericCanvasSkillprintAdapter {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.config = config;
    this.manager = new SkillprintManager(config, () => this.canvas);
  }
  static create(canvas, config) {
    return new _GenericCanvasSkillprintAdapter(canvas, config);
  }
  startSession(targetMood, customPlayerId = null) {
    return this.manager.startGameSession(targetMood, customPlayerId);
  }
  stopSession() {
    return this.manager.stopGameSession();
  }
  logEvent(event, data) {
    return this.manager.logEvent(event, data);
  }
  registerParameter(parameterName, updateAction, expectedType = null) {
    this.manager.registerParameterModifier(parameterName, updateAction, expectedType);
  }
};
export {
  ApiEnvironment,
  GameEvent,
  GenericCanvasSkillprintAdapter,
  LogLevel,
  MAX_EVENTS_PER_UPLOAD,
  Mood,
  ParameterDefinition,
  ParameterInfo,
  ParameterType,
  ParameterUpdateResult,
  PhaserSkillprintAdapter,
  PixiSkillprintAdapter,
  PollResultsResponse,
  ScreenshotUtility,
  SessionTimeline,
  SkillprintAPIClient,
  SkillprintApiError,
  SkillprintConfig,
  SkillprintManager,
  SkillprintSessionHelper,
  StartSessionRequest,
  TelemetryEventRequest,
  ThreeSkillprintAdapter,
  WebGLUrlParameterExtractor,
  isUniversalEvent
};
//# sourceMappingURL=index.js.map