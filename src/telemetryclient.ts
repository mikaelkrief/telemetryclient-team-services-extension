//---------------------------------------------------------------------
// <copyright file="TelemetryClient.ts">
//    This code is licensed under the MIT License.
//    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF 
//    ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
//    TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
//    PARTICULAR PURPOSE AND NONINFRINGEMENT.
// </copyright>
// <summary>Application Insights Telemetry Client Class</summary>
//---------------------------------------------------------------------
/// <reference types="vss-web-extension-sdk" />
import { AppInsights } from "applicationinsights-js"

export class TelemetryClientSettings {
    public key: string;
    public extensioncontext: string;
    public disableTelemetry : string = "false";
    public disableAjaxTracking : string = "false";
    public enableDebug : string = "false";
}

export class TelemetryClient {
    private static _instance: TelemetryClient;
    public ExtensionContext: string;
    private IsAvailable: boolean = true;

    private constructor() {}

    public static getClient(settings: TelemetryClientSettings): TelemetryClient {

        if (!this._instance) {
            console.log("Creating new TelemetryClient!");
            this._instance = new TelemetryClient();
            this._instance.Init(settings);
        }

        return this._instance;
    }

    private Init(settings: TelemetryClientSettings) {

        console.log("TelemetryClient settings key: " + settings.key.substring(0,8)+ "************");
        console.log("TelemetryClient settings extension context: " + settings.extensioncontext);
        console.log("TelemetryClient settings disableTelemetry: " + (settings.disableTelemetry === "true"));
        console.log("TelemetryClient settings disableAjaxTracking: " + (settings.disableAjaxTracking === "true"));
        console.log("TelemetryClient settings enableDebug: " + (settings.enableDebug === "true"));

        var config: any = {
            instrumentationKey: settings.key,
            disableTelemetry : (settings.disableTelemetry === "true"),
            disableAjaxTracking : (settings.disableAjaxTracking === "true"),
            enableDebug : (settings.enableDebug === "true")
        };

        this.ExtensionContext = settings.extensioncontext;

        try {
            var webContext = VSS.getWebContext();

            AppInsights.downloadAndSetup(config);
            AppInsights.setAuthenticatedUserContext(webContext.user.id, webContext.collection.id);
        }
        catch (e) {
            console.log(e);
        }
    }

    public trackPageView(name?: string, url?: string, properties?: { [name: string]: string; }, measurements?: { [name: string]: number; }, duration?: number) {
        try {
                AppInsights.trackPageView(this.ExtensionContext + "." + name, url, properties, measurements, duration);
                AppInsights.flush();
        }
        catch (e) {
            console.log(e);
        }
    }

    public trackEvent(name: string, properties?: { [name: string]: string; }, measurements?: { [name: string]: number; }) {
        try {
                console.log("Tracking event: " + this.ExtensionContext + "." + name);
                AppInsights.trackEvent(this.ExtensionContext + "." + name, properties, measurements);
                AppInsights.flush();
        }
        catch (e) {
            console.log(e);
        }
    }

    public trackException(exceptionMessage: string, handledAt?: string, properties?: { [name: string]: string; }, measurements?: { [name: string]: number; }) {
        try {
                console.error(exceptionMessage);

                var error: Error = {
                    name: this.ExtensionContext + "." + handledAt,
                    message: exceptionMessage
                };

                AppInsights.trackException(error, handledAt, properties, measurements);
                AppInsights.flush();
        }
        catch (e) {
            console.log(e);
        }
    }

    public trackMetric(name: string, average: number, sampleCount?: number, min?: number, max?: number, properties?: { [name: string]: string; }) {
        try {
                AppInsights.trackMetric(this.ExtensionContext + "." + name, average, sampleCount, min, max, properties);
                AppInsights.flush();
        }
        catch (e) {
            console.log(e);
        }
    }

}
