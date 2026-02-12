export class StartSessionRequest {
    constructor(sessionId, game, targetMood) {
        this.sessionId = sessionId;
        this.game = game;
        this.targetMood = targetMood;
    }
}

export class ParameterInfo {
    constructor(name, type, description, minValue = null, maxValue = null) {
        this.name = name;
        this.type = type;
        this.description = description;
        this.minValue = minValue;
        this.maxValue = maxValue;
    }
}

export class ParameterUpdateResult {
    constructor(data = {}) {
        this.parameterName = data.parameterName || '';
        this.newValue = data.newValue;
        this._rawJson = JSON.stringify(data);
    }

    getParsedValue() {
        if (this.newValue !== null && this.newValue !== undefined && this.newValue !== '') {
            return this.newValue;
        }

        // Try to find a field with the same name as parameterName
        if (this.parameterName && this[this.parameterName] !== undefined) {
            return this[this.parameterName];
        }

        return null;
    }

    convertToType(targetType) {
        const value = this.getParsedValue();
        if (value === null || value === undefined) {
            return null;
        }

        try {
            switch (targetType) {
                case 'number':
                    return Number(value);
                case 'integer':
                    return parseInt(value);
                case 'boolean':
                    return Boolean(value);
                case 'string':
                    return String(value);
                default:
                    return value;
            }
        } catch (error) {
            console.error(`Failed to convert value '${value}' to type ${targetType}:`, error);
            return null;
        }
    }

    convertToParameterType(paramDef) {
        const rawValue = this.getParsedValue();
        if (rawValue === null || rawValue === undefined) {
            return null;
        }

        try {
            let convertedValue;

            switch (paramDef.type) {
                case ParameterType.FLOAT:
                    convertedValue = parseFloat(rawValue);
                    break;
                case ParameterType.INTEGER:
                    convertedValue = parseInt(rawValue);
                    break;
                case ParameterType.BOOLEAN:
                    convertedValue = Boolean(rawValue);
                    break;
                default:
                    convertedValue = rawValue;
                    break;
            }

            if (paramDef.isValid(convertedValue)) {
                return convertedValue;
            } else {
                console.warn(`Converted value ${convertedValue} for parameter ${this.parameterName} is outside valid range [${paramDef.minValue}, ${paramDef.maxValue}]`);

                // Clamp numeric values to valid range
                if (paramDef.type === ParameterType.FLOAT && typeof convertedValue === 'number') {
                    return Math.max(paramDef.minValue, Math.min(paramDef.maxValue, convertedValue));
                } else if (paramDef.type === ParameterType.INTEGER && Number.isInteger(convertedValue)) {
                    return Math.max(Math.floor(paramDef.minValue), Math.min(Math.floor(paramDef.maxValue), convertedValue));
                }

                return convertedValue;
            }
        } catch (error) {
            console.error(`Error converting parameter ${this.parameterName}:`, error);
            return null;
        }
    }
}

export class PollResultsResponse {
    constructor(data = {}) {
        this.gameplayTips = data.gameplayTips || '';
        this.state = data.state || '';
        this.parameterUpdates = (data.parameterUpdates || []).map(update => new ParameterUpdateResult(update));
    }
}