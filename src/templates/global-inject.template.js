(() => {
    const globalBundle = __global-inject-list__;
    const $head = DOCUMENT.getElementsByTagName('head')[0];
    globalBundle.forEach(bundle => {
            switch(bundle.type) {
                case 'js':
                const script = DOCUMENT.createElement('script');
                script.src = bundle.path;
                $head.appendChild(script);
                break;
            case 'css':
                const link = DOCUMENT.createElement('link');
                link.href = bundle.path;
                link.rel = 'stylesheet';
                $head.appendChild(link);
            break;
        }
    })
})();