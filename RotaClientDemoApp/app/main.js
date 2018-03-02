require.config({
    paths: {
        "es6-promise": 'es6-promise.min'
    },
    map: {
        '*': { 'config/oidc-manager': "cookie-manager" },
    },
    packages: [
        {
            name: 'rota',
            location: 'rota/config'
        }
    ]
});
require(["rota"]);
