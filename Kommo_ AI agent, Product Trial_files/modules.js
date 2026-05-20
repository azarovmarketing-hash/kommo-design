define('sensei-js', [], function () {
    return {
        load: function (name, _, onload) {
            onload.fromText(name);
        }
    };
});