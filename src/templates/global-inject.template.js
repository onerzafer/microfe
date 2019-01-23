(() => {
    const globalBundle = __global-inject-list__;
    const $head = document.getElementsByTagName('head')[0];
    globalBundle.forEach(bundle => {
            switch(bundle.type) {
                case 'js':
                const script = document.createElement('script');
                script.src = bundle.path;
                $head.appendChild(script);
                break;
            case 'css':
                const link = document.createElement('link');
                link.href = bundle.path;
                link.rel = 'stylesheet';
                $head.appendChild(link);
            break;
        }
    })
})();
