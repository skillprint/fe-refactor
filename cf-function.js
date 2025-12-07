function handler(event) {
    var request = event.request;
    var uri = request.uri;

    // 1. Rewrite /public/X to /X to "keep the url" but serve from root
    if (uri.startsWith('/public/')) {
        request.uri = uri.replace('/public/', '/');
    }

    // 2. Handle Directory Indexes for App Router (Next.js Static Export)
    // If it ends in /, append index.html
    if (request.uri.endsWith('/')) {
        request.uri += 'index.html';
    }
    // If it doesn't have an extension, assume it's a directory and append /index.html
    // This handles /game/2048 -> /game/2048/index.html
    else if (!request.uri.includes('.')) {
        request.uri += '/index.html';
    }

    return request;
}
