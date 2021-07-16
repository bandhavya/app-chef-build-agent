const command = require('@wavemaker/wm-cordova-cli/src/command');
const logger = require('@wavemaker/wm-cordova-cli/src/logger');
const fs = require('fs-extra');

const loggerLabel = 'CordovaCook';

class CordovaCook {

    constructor(kitchen) {
        this.kitchen = kitchen;
    }

    async doWork(buildTaskToken, settings, buildFolder) {
        const start = Date.now();
        logger.info({
            label: loggerLabel,
            message: "build is about to start in the next milliseconds."
        });
        const buildType = settings.buildType === 'production' ? 'release' : 'debug';
        let result = {};
        try {
            if (settings.platform === 'ios') {
                result = await command.build({
                    platform: settings.platform,
                    src: `${buildFolder}src/`,
                    dest: `${buildFolder}build/`,
                    iCertificate: buildFolder + settings.codesign.certificate,
                    iCertificatePassword: settings.codesign.unlockPassword,
                    iProvisioningFile: buildFolder + settings.codesign.provisioningProfile,
                    buildType: buildType,
                    packageType: settings.packageType,
                    cordovaVersion: settings.cordovaVersion,
                    cordovaIosVersion: settings.cordovaIosVersion,
                    allowHooks: true
                });
            } else if (settings.platform === 'android') {
                result = await command.build({
                    platform: settings.platform,
                    src: `${buildFolder}src/`,
                    dest: `${buildFolder}build/`,
                    aKeyStore: settings.codesign.keyStore ? buildFolder + settings.codesign.keyStore : null,
                    aStorePassword: settings.codesign.storePassword,
                    aKeyAlias: settings.codesign.keyAlias,
                    aKeyPassword: settings.codesign.keyPassword,
                    buildType: buildType,
                    packageType: settings.packageType,
                    cordovaVersion: settings.cordovaVersion,
                    cordovaAndroidVersion: settings.cordovaAndroidVersion,
                    androidXMigrationEnabled: true,
                    allowHooks: true
                });
            };
        } catch (e) {
            logger.error({
                label: loggerLabel,
                message: "build failed."
            });
            console.error(e);
        }
        logger.info({
            label: loggerLabel,
            message: `Build took ${(Date.now() - start)/1000}s`
        });
        await this.kitchen.waiter.serve(result && result.success, buildTaskToken, buildFolder, settings);
    }
}

module.exports = CordovaCook;
