export class ParameterDefinition {
    constructor(options = {}) {
        this.parameterName = options.parameterName || '';
        this.description = options.description || '';
        this.howSDKChangesIt = options.howSDKChangesIt || '';
        this.type = options.type || ParameterType.FLOAT;
        this.minValue = options.minValue || 0;
        this.maxValue = options.maxValue || 100;
        this.defaultValue = options.defaultValue || '';
        this.updateAction = null;
    }

    isValid(value) {
        switch (this.type) {
            case ParameterType.FLOAT:
                return typeof value === 'number' && value >= this.minValue && value <= this.maxValue;
            case ParameterType.INTEGER:
                return Number.isInteger(value) && value >= this.minValue && value <= this.maxValue;
            case ParameterType.BOOLEAN:
                return typeof value === 'boolean';
            default:
                return false;
        }
    }

    convertValue(rawValue) {
        try {
            switch (this.type) {
                case ParameterType.FLOAT:
                    return parseFloat(rawValue);
                case ParameterType.INTEGER:
                    return parseInt(rawValue);
                case ParameterType.BOOLEAN:
                    return Boolean(rawValue);
                default:
                    return rawValue;
            }
        } catch (error) {
            console.error(`Error converting value for parameter ${this.parameterName}:`, error);
            return null;
        }
    }
}