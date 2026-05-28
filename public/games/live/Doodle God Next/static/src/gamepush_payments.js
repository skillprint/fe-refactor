(function (global) {
    'use strict';

    if (global.DGPlatformPayments) return;

    const config = () => global.DGConfig?.gamePush?.payments || {};
    const state = {
        ready: false,
        backend: 'none',
        products: [],
        purchases: [],
        lastError: '',
        lastAction: '',
    };
    const requestedProductTags = new Set();
    let requestedProductTimer = 0;

    function log(action, details, level) {
        state.lastAction = action;
        global.DGGamePush?.log?.('payments', action, details, level);
        if ((config().logPriceList || global.DGConfig?.debug) && global.console) {
            const method = level === 'warn' ? 'warn' : level === 'error' ? 'error' : 'info';
            global.console[method]('[DGPlatformPayments]', action, details || '');
        }
    }

    function getPayments() {
        const gp = global.DGGamePush?.getGp?.();
        return gp && gp.payments ? gp.payments : null;
    }

    function allowFakeFallback() {
        return false;
    }

    function getFallbackMessage(kind) {
        if (kind === 'product-missing') {
            return config().productMissingMessage || config().unavailableMessage || 'Покупки сейчас недоступны, попробуйте позже.';
        }
        return config().unavailableMessage || 'Покупки сейчас недоступны, попробуйте позже.';
    }

    function asArray(value) {
        return Array.isArray(value) ? value : [];
    }

    function productKey(product) {
        if (!product) return '';
        return String(product.tag || product.productTag || product.id || product.productId || product.name || '');
    }

    function matchesProduct(product, name) {
        if (!product) return false;
        const key = String(name || '');

        return String(product.tag || '') === key ||
            String(product.productTag || '') === key ||
            String(product.id || '') === key ||
            String(product.productId || '') === key ||
            String(product.name || '') === key;
    }

    function resolveProduct(name) {
        return state.products.find((product) => matchesProduct(product, name)) || null;
    }

    function productRequest(product, name) {
        if (product?.tag) return { tag: product.tag };
        if (product?.productTag) return { tag: product.productTag };
        if (product?.id) return { id: product.id };
        if (product?.productId) return { id: product.productId };
        return { tag: name };
    }

    function productPrice(product) {
        if (!product) return '';
        return product.priceLabel ||
            product.priceText ||
            product.localizedPrice ||
            product.price ||
            (product.currency && product.amount ? String(product.amount) + ' ' + product.currency : '') ||
            '';
    }

    function productTitle(product) {
        if (!product) return '';
        return product.name || product.title || product.description || '';
    }

    function shouldLogPriceList() {
        return !!(config().logPriceList || global.DGConfig?.debug);
    }

    function getRequestedProducts() {
        const known = new Set(state.products.map(productKey).filter(Boolean));
        return Array.from(requestedProductTags).sort().map((tag) => ({
            tag,
            status: known.has(tag) ? 'ok' : 'missing',
        }));
    }

    function dumpRequestedProducts() {
        const rows = getRequestedProducts();
        if (!global.console || !rows.length) return rows;

        global.console.info('[DGPlatformPayments] requested inapps: ' + rows.length);
        if (typeof global.console.table === 'function') global.console.table(rows);
        else global.console.info(rows.map((row) => row.tag).join('\n'));

        const missing = rows.filter((row) => row.status === 'missing').map((row) => row.tag);
        if (missing.length) {
            global.console.warn('[DGPlatformPayments] missing in GamePush:\n' + missing.join('\n'));
        }
        global.console.info('copy(window.DGPlatformPayments.getRequestedProductTags().join("\\n"))');
        return rows;
    }

    function recordRequestedProduct(name) {
        if (!shouldLogPriceList()) return;

        const tag = String(name || '').trim();
        if (!tag || requestedProductTags.has(tag)) return;

        requestedProductTags.add(tag);
        if (!global.console) return;

        global.clearTimeout(requestedProductTimer);
        requestedProductTimer = global.setTimeout(dumpRequestedProducts, 250);
    }

    function receiptFromPurchase(purchase) {
        try {
            return btoa(unescape(encodeURIComponent(JSON.stringify(purchase || {}))));
        } catch (_) {
            return String(purchase?.id || purchase?.tag || Date.now());
        }
    }

    function resolvePurchaseName(purchase) {
        if (!purchase) return '';

        const direct = purchase.tag || purchase.productTag || purchase.productId || purchase.name;
        if (direct) return String(direct);

        const purchaseId = purchase.id || purchase.purchaseId || '';
        if (!purchaseId) return '';

        const product = state.products.find((candidate) => (
            String(candidate.id || '') === String(purchaseId) ||
            String(candidate.productId || '') === String(purchaseId)
        ));
        return productKey(product) || String(purchaseId);
    }

    function canCallbackCpp() {
        return !!(global.Module && typeof global.Module.ccall === 'function');
    }

    function finishCpp(kind, opaque, name, receipt, ok, error) {
        if (!canCallbackCpp()) {
            log('cpp-callback-unavailable', { kind, opaque, name, ok }, 'warn');
            return false;
        }

        try {
            global.Module.ccall(
                'ems_iap_finished_opaque',
                null,
                ['number', 'number', 'string', 'string', 'number', 'string'],
                [kind, Number(opaque || 0), name || '', receipt || '', ok ? 1 : 0, error || '']
            );
        } catch (callbackError) {
            global.Module.ccall(
                'ems_iap_finished',
                null,
                ['number', 'string', 'string', 'number', 'string'],
                [kind, name || '', receipt || '', ok ? 1 : 0, error || '']
            );
        }
        return true;
    }

    async function init() {
        const gp = await global.DGGamePush?.whenReady?.();
        const payments = getPayments();

        if (!gp || !payments || payments.isAvailable === false) {
            state.ready = false;
            state.backend = 'none';
            log('fallback', 'payments unavailable');
            return false;
        }

        try {
            let fetched = null;
            if (typeof payments.fetchProducts === 'function') {
                fetched = await payments.fetchProducts();
            }
            state.products = asArray(payments.products).length ? asArray(payments.products) : asArray(fetched);
            state.purchases = asArray(payments.purchases);
            state.ready = true;
            state.backend = 'gamepush-payments';
            log('ready', {
                products: state.products.length,
                purchases: state.purchases.length,
                productTags: state.products.map(productKey).filter(Boolean),
            });
            return true;
        } catch (error) {
            state.lastError = error && error.message ? error.message : String(error);
            state.ready = false;
            log('init-failed', state.lastError, 'warn');
            return false;
        }
    }

    function getPriceListItemText(name) {
        recordRequestedProduct(name);
        const product = resolveProduct(name);
        if (!product) return '';

        const price = productPrice(product);
        const title = productTitle(product) || name;
        if (!price) return '';
        return price + '\n' + title;
    }

    function getPurchasesText() {
        const rows = state.purchases.map(function (purchase) {
            const name = resolvePurchaseName(purchase);
            if (!name) return '';
            return name + '\t' + receiptFromPurchase(purchase);
        }).filter(Boolean);

        log('restore-purchases', { count: rows.length });
        return rows.join('\n');
    }

    function buyInAppFromCpp(name, opaque) {
        const payments = getPayments();
        if (!state.ready || !payments || typeof payments.purchase !== 'function') return false;
        if (!canCallbackCpp()) return false;

        const product = resolveProduct(name);
        if (!product) {
            const message = getFallbackMessage('product-missing');
            log('purchase-product-missing', {
                name,
                available: state.products.map(productKey).filter(Boolean),
            }, 'warn');
            finishCpp(0, opaque, name, '', false, message);
            return true;
        }

        (async function () {
            try {
                const request = productRequest(product, name);
                log('purchase-start', { name, request });
                const purchase = await payments.purchase(request);
                state.purchases = asArray(payments.purchases);
                log('purchase-success', { name, product: productKey(product) });
                finishCpp(0, opaque, name, receiptFromPurchase(purchase), true, '');
            } catch (error) {
                const message = error && error.message ? error.message : String(error);
                state.lastError = message;
                log('purchase-failed', { name, error: message }, 'warn');
                finishCpp(0, opaque, name, '', false, message);
            }
        })();

        return true;
    }

    function consumeInAppFromCpp(name, receipt, opaque) {
        const payments = getPayments();
        if (!state.ready || !payments || typeof payments.consume !== 'function') return false;
        if (!canCallbackCpp()) return false;

        const product = resolveProduct(name);
        if (!product) {
            const message = getFallbackMessage('product-missing');
            log('consume-product-missing', {
                name,
                available: state.products.map(productKey).filter(Boolean),
            }, 'warn');
            finishCpp(1, opaque, name, receipt || '', false, message);
            return true;
        }

        (async function () {
            try {
                const request = productRequest(product, name);
                log('consume-start', { name, request });
                await payments.consume(request);
                log('consume-success', { name, product: productKey(product) });
                finishCpp(1, opaque, name, receipt || '', true, '');
            } catch (error) {
                const message = error && error.message ? error.message : String(error);
                state.lastError = message;
                log('consume-failed', { name, error: message }, 'warn');
                finishCpp(1, opaque, name, receipt || '', false, message);
            }
        })();

        return true;
    }

    global.DGPlatformPayments = {
        init,
        allowFakeFallback,
        getFallbackMessage,
        isEnabled: function () {
            return state.ready;
        },
        isReady: function () {
            return state.ready;
        },
        getPriceListItemText,
        getPurchasesText,
        buyInAppFromCpp,
        consumeInAppFromCpp,
        dumpRequestedProducts,
        getRequestedProducts,
        getRequestedProductTags: function () {
            return getRequestedProducts().map((row) => row.tag);
        },
        getState: function () {
            return { ...state, requestedProducts: getRequestedProducts() };
        },
    };

    global.DGPlatform?.addReadyTask?.('gamepush-payments', init);
})(window);
