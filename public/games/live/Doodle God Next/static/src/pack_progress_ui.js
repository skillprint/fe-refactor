(function () {
    class PackProgressBar {
        constructor(opts = {}) {
            this.id = opts.id || `pack-bar-${Math.random().toString(36).slice(2)}`;
            this.top = opts.top || '0px';
            this.height = opts.height || '17px';
            this.zIndex = Number(opts.zIndex || 10050);
            this.baseStart = opts.baseStart || '#0f8f2f';
            this.baseEnd = opts.baseEnd || '#12b53a';
            this.trackColor = opts.trackColor || '#333';
            this.textColor = opts.textColor || '#fff';
            this._el = null;
            this._text = null;
            this._onClick = null;
            this._pulseKey = '';
        }

        ensure() {
            if (typeof document === 'undefined') return null;
            if (this._el) return this._el;

            const btn = document.createElement('button');
            btn.id = this.id;
            btn.type = 'button';
            Object.assign(btn.style, {
                position: 'fixed',
                top: this.top,
                left: '0',
                right: '0',
                height: this.height,
                border: '0',
                margin: '0',
                padding: '0 10px',
                background: `linear-gradient(90deg, ${this.baseStart}, ${this.baseEnd})`,
                color: this.textColor,
                fontSize: '8px',
                fontWeight: '600',
                letterSpacing: '0.2px',
                textAlign: 'center',
                zIndex: String(this.zIndex),
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'default',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.35)',
            });

            const text = document.createElement('span');
            btn.appendChild(text);

            btn.addEventListener('click', () => {
                if (!this._onClick || btn.disabled) return;
                this._onClick();
            });

            document.body.appendChild(btn);
            this._el = btn;
            this._text = text;
            return this._el;
        }

        setOnClick(handler) {
            this._onClick = typeof handler === 'function' ? handler : null;
        }

        showMessage(message, opts = {}) {
            const el = this.ensure();
            if (!el || !this._text) return;

            this._text.textContent = String(message || '');
            this._text.style.fontSize = opts.fontSize || '10px';
            this._text.style.fontWeight = opts.fontWeight || '600';
            el.style.background = opts.background || `linear-gradient(90deg, ${this.baseStart}, ${this.baseEnd})`;
            el.style.display = 'flex';

            const clickable = !!opts.clickable;
            el.disabled = !clickable;
            el.style.cursor = clickable ? 'pointer' : 'default';
            if (!clickable && !opts.forceVisible) {
                if (window.HasRelease == true) {
                    el.style.display = 'none';
                }
            }
        }

        showProgress(label, loaded, total, opts = {}) {
            const safeTotal = total > 0 ? total : Math.max(loaded, 1);
            const pct = Math.max(0, Math.min(100, (loaded / safeTotal) * 100));
            const pctFill = pct.toFixed(2);
            const start = opts.startColor || this.baseStart;
            const end = opts.endColor || this.baseEnd;
            const track = opts.trackColor || this.trackColor;

            this.showMessage(`${label}: ${pct.toFixed(0)}%`, {
                clickable: false,
                fontSize: '10px',
                fontWeight: '600',
                background: `linear-gradient(90deg, ${start} 0%, ${end} ${pctFill}%, ${track} ${pctFill}%, ${track} 100%)`,
            });
        }

        showError(message) {
            this.showMessage(message, {
                clickable: false,
                forceVisible: true,
                fontSize: '10px',
                fontWeight: '500',
                background: 'linear-gradient(90deg, #7d1b1b 0%, #a92323 100%)',
            });
        }

        pulseOnce(key) {
            if (!key) return;
            const el = this.ensure();
            if (!el) return;
            if (this._pulseKey === key) return;
            this._pulseKey = key;

            el.animate([
                { transform: 'scaleY(1)', opacity: 0.95 },
                { transform: 'scaleY(1.08)', opacity: 1.0 },
                { transform: 'scaleY(1)', opacity: 0.95 },
            ], {
                duration: 700,
                easing: 'ease-out',
                iterations: 1,
            });
        }

        resetPulse() {
            this._pulseKey = '';
        }

        hide() {
            const el = this.ensure();
            if (!el) return;
            el.style.display = 'none';
            this.resetPulse();
        }
    }

    window.PackProgressBar = PackProgressBar;
})();
