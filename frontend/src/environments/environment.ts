// https://www.reddit.com/r/docker/comments/l01v5i/dockercompose_set_environmental_variables_to/?rdt=41205
// https://itnext.io/how-to-use-system-environment-variables-process-env-in-angular-application-b9e7104dcc98
// https://answers.netlify.com/t/angular-environment-ts-and-env-struggles/104797
//  https://dev.to/chihab/announcing-ngx-env-builder-13m2
/*export const environment = {
    production: false,
    frontendPort: process.env['NG_FRONTEND_IP_ADDRESS'] || '4200',
    hostServerUrl: process.env['NG_HOST_SERVER_URL'] || 'http://localhost:8080'
};*/

export const environment = {
    production: false,
    frontendPort: 4200,
    hostServerUrl: 'http://localhost:8080'
};