define([], function() {
    return function ThemeService() {
        this.themeObserver = null;
        this.robocodeFrameReady = false;
        this.senseiFrameReady = false;

        this.init = function() {
            window.addEventListener('message', (event) => {
                if (event.data.type === 'robocode_frame_ready') {
                    this.robocodeFrameReady = true;
                    this.sendThemeToRobocode();
                }
                if (event.data.type === 'sensei_frame_ready') {
                    this.senseiFrameReady = true;
                    this.sendThemeToRobocode();
                }
            });

            let subscribe = SENSEI.events.subscribe('sensei_change_theme', (data) => {
                if (this.robocodeFrameReady || this.senseiFrameReady) {
                    this.sendThemeToRobocode(data.theme);
                }
            });

            this.themeObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'data-color-scheme') {
                        const currentTheme = document.documentElement.getAttribute('data-color-scheme');
                        const theme = currentTheme === 'dark' ? 'dark' : 'light';
                        window.SENSEI.events.trigger('sensei_change_theme', { theme });
                    }
                });
            });
            this.themeObserver.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['data-color-scheme']
            });
            const initialTheme = document.documentElement.getAttribute('data-color-scheme');
            const theme = initialTheme === 'dark' ? 'dark' : 'light';
            window.SENSEI.events.trigger('sensei_change_theme', { theme });
        };

        this.sendThemeToRobocode = function(theme) {
            const iframes = document.querySelectorAll('iframe.robocode-sensei-iframe');
            const currentTheme = theme || (document.documentElement.getAttribute('data-color-scheme') === 'dark' ? 'dark' : 'light');

            iframes.forEach(iframe => {
                iframe.contentWindow.postMessage({
                    type: 'sensei_change_theme',
                    theme: currentTheme
                }, '*');
            });
        };
        
        this.destroy = function() {
            if (this.themeObserver) {
                this.themeObserver.disconnect();
                this.themeObserver = null;
            }
        };
    };
});