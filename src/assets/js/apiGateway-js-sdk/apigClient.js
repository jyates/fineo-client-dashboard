/*
 * Copyright 2010-2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *  http://aws.amazon.com/apache2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

var apigClientFactory = {};
apigClientFactory.newClient = function (config) {
    var apigClient = { };
    if(config === undefined) {
        config = {
            accessKey: '',
            secretKey: '',
            sessionToken: '',
            region: '',
            apiKey: undefined,
            defaultContentType: 'application/json',
            defaultAcceptType: 'application/json'
        };
    }
    if(config.accessKey === undefined) {
        config.accessKey = '';
    }
    if(config.secretKey === undefined) {
        config.secretKey = '';
    }
    if(config.apiKey === undefined) {
        config.apiKey = '';
    }
    if(config.sessionToken === undefined) {
        config.sessionToken = '';
    }
    if(config.region === undefined) {
        config.region = 'us-east-1';
    }
    //If defaultContentType is not defined then default to application/json
    if(config.defaultContentType === undefined) {
        config.defaultContentType = 'application/json';
    }
    //If defaultAcceptType is not defined then default to application/json
    if(config.defaultAcceptType === undefined) {
        config.defaultAcceptType = 'application/json';
    }

    
    // extract endpoint and path from url
    var invokeUrl = 'https://kgtq36jvac.execute-api.us-east-1.amazonaws.com/prod';
    var endpoint = /(^https?:\/\/[^\/]+)/g.exec(invokeUrl)[1];
    var pathComponent = invokeUrl.substring(endpoint.length);

    var sigV4ClientConfig = {
        accessKey: config.accessKey,
        secretKey: config.secretKey,
        sessionToken: config.sessionToken,
        serviceName: 'execute-api',
        region: config.region,
        endpoint: endpoint,
        defaultContentType: config.defaultContentType,
        defaultAcceptType: config.defaultAcceptType
    };

    var authType = 'NONE';
    if (sigV4ClientConfig.accessKey !== undefined && sigV4ClientConfig.accessKey !== '' && sigV4ClientConfig.secretKey !== undefined && sigV4ClientConfig.secretKey !== '') {
        authType = 'AWS_IAM';
    }

    var simpleHttpClientConfig = {
        endpoint: endpoint,
        defaultContentType: config.defaultContentType,
        defaultAcceptType: config.defaultAcceptType
    };

    var apiGatewayClient = apiGateway.core.apiGatewayClientFactory.newClient(simpleHttpClientConfig, sigV4ClientConfig);
    
    
    
    apigClient.schemaGet = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var schemaGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/schema').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(schemaGetRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.schemaPatch = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['body'], ['body']);
        
        var schemaPatchRequest = {
            verb: 'patch'.toUpperCase(),
            path: pathComponent + uritemplate('/schema').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(schemaPatchRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.schemaFieldGet = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['fieldName', 'metricName'], ['body']);
        
        var schemaFieldGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/schema/field').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, ['fieldName', 'metricName']),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(schemaFieldGetRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.schemaFieldPost = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['body'], ['body']);
        
        var schemaFieldPostRequest = {
            verb: 'post'.toUpperCase(),
            path: pathComponent + uritemplate('/schema/field').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(schemaFieldPostRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.schemaFieldPatch = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['body'], ['body']);
        
        var schemaFieldPatchRequest = {
            verb: 'patch'.toUpperCase(),
            path: pathComponent + uritemplate('/schema/field').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(schemaFieldPatchRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.schemaMetricGet = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['metricName'], ['body']);
        
        var schemaMetricGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/schema/metric').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, ['metricName']),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(schemaMetricGetRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.schemaMetricPost = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['body'], ['body']);
        
        var schemaMetricPostRequest = {
            verb: 'post'.toUpperCase(),
            path: pathComponent + uritemplate('/schema/metric').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(schemaMetricPostRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.schemaMetricDelete = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['body'], ['body']);
        
        var schemaMetricDeleteRequest = {
            verb: 'delete'.toUpperCase(),
            path: pathComponent + uritemplate('/schema/metric').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(schemaMetricDeleteRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.schemaMetricPatch = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['body'], ['body']);
        
        var schemaMetricPatchRequest = {
            verb: 'patch'.toUpperCase(),
            path: pathComponent + uritemplate('/schema/metric').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(schemaMetricPatchRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.schemaMetricsGet = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var schemaMetricsGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/schema/metrics').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(schemaMetricsGetRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.schemaUserGet = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var schemaUserGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/schema/user').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(schemaUserGetRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.schemaUserPatch = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['body'], ['body']);
        
        var schemaUserPatchRequest = {
            verb: 'patch'.toUpperCase(),
            path: pathComponent + uritemplate('/schema/user').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(schemaUserPatchRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.schemaUserOptions = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var schemaUserOptionsRequest = {
            verb: 'options'.toUpperCase(),
            path: pathComponent + uritemplate('/schema/user').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(schemaUserOptionsRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.schemaUserFieldGet = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['fieldName', 'metricName'], ['body']);
        
        var schemaUserFieldGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/schema/user/field').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, ['fieldName', 'metricName']),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(schemaUserFieldGetRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.schemaUserFieldPost = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['body'], ['body']);
        
        var schemaUserFieldPostRequest = {
            verb: 'post'.toUpperCase(),
            path: pathComponent + uritemplate('/schema/user/field').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(schemaUserFieldPostRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.schemaUserFieldPatch = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['body'], ['body']);
        
        var schemaUserFieldPatchRequest = {
            verb: 'patch'.toUpperCase(),
            path: pathComponent + uritemplate('/schema/user/field').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(schemaUserFieldPatchRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.schemaUserFieldOptions = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var schemaUserFieldOptionsRequest = {
            verb: 'options'.toUpperCase(),
            path: pathComponent + uritemplate('/schema/user/field').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(schemaUserFieldOptionsRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.schemaUserMetricGet = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['metricName'], ['body']);
        
        var schemaUserMetricGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/schema/user/metric').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, ['metricName']),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(schemaUserMetricGetRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.schemaUserMetricPost = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['body'], ['body']);
        
        var schemaUserMetricPostRequest = {
            verb: 'post'.toUpperCase(),
            path: pathComponent + uritemplate('/schema/user/metric').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(schemaUserMetricPostRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.schemaUserMetricDelete = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['body'], ['body']);
        
        var schemaUserMetricDeleteRequest = {
            verb: 'delete'.toUpperCase(),
            path: pathComponent + uritemplate('/schema/user/metric').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(schemaUserMetricDeleteRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.schemaUserMetricPatch = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['body'], ['body']);
        
        var schemaUserMetricPatchRequest = {
            verb: 'patch'.toUpperCase(),
            path: pathComponent + uritemplate('/schema/user/metric').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(schemaUserMetricPatchRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.schemaUserMetricOptions = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var schemaUserMetricOptionsRequest = {
            verb: 'options'.toUpperCase(),
            path: pathComponent + uritemplate('/schema/user/metric').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(schemaUserMetricOptionsRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.schemaUserMetricsGet = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var schemaUserMetricsGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/schema/user/metrics').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(schemaUserMetricsGetRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.schemaUserMetricsOptions = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var schemaUserMetricsOptionsRequest = {
            verb: 'options'.toUpperCase(),
            path: pathComponent + uritemplate('/schema/user/metrics').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(schemaUserMetricsOptionsRequest, authType, additionalParams, config.apiKey);
    };
    

    return apigClient;
};
