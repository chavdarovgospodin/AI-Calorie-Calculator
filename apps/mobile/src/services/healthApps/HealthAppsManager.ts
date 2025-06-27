import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';

export enum HealthAppType {
  APPLE_HEALTH = 'healthkit',
  GOOGLE_FIT = 'googlefit',
  SAMSUNG_HEALTH = 'samsung_health',
  HUAWEI_HEALTH = 'huawei_health',
  DEVICE_SENSORS = 'device_sensors',
  MANUAL = 'manual',
}

export interface HealthApp {
  type: HealthAppType;
  name: string;
  description: string;
  isAvailable: boolean;
  isConnected: boolean;
}

export interface ActivityData {
  date: string;
  caloriesBurned: number;
  steps?: number;
  distance?: number;
  duration?: number;
  activityType?: string;
  source: HealthAppType;
}

class HealthAppsManager {
  private static instance: HealthAppsManager;
  private availableApps: HealthApp[] = [];
  private selectedApp: HealthAppType | null = null;

  private constructor() {}

  static getInstance(): HealthAppsManager {
    if (!HealthAppsManager.instance) {
      HealthAppsManager.instance = new HealthAppsManager();
    }
    return HealthAppsManager.instance;
  }

  async detectAvailableApps(): Promise<HealthApp[]> {
    this.availableApps = [];

    if (Platform.OS === 'ios') {
      // iOS apps
      this.availableApps.push({
        type: HealthAppType.APPLE_HEALTH,
        name: 'Apple Health',
        description: 'Integrates with all iOS health apps',
        isAvailable: true,
        isConnected: false,
      });
    } else {
      // Android apps
      const brand = await DeviceInfo.getBrand();

      // Google Fit - available on most Android devices
      this.availableApps.push({
        type: HealthAppType.GOOGLE_FIT,
        name: 'Google Fit',
        description: 'Integrates with most Android fitness apps',
        isAvailable: await this.checkGoogleFitAvailable(),
        isConnected: false,
      });

      // Samsung Health - for Samsung devices
      if (brand.toLowerCase() === 'samsung') {
        this.availableApps.push({
          type: HealthAppType.SAMSUNG_HEALTH,
          name: 'Samsung Health',
          description: 'Direct Samsung Health integration',
          isAvailable: await this.checkSamsungHealthAvailable(),
          isConnected: false,
        });
      }

      // Huawei Health - for Huawei devices
      if (brand.toLowerCase() === 'huawei' || brand.toLowerCase() === 'honor') {
        this.availableApps.push({
          type: HealthAppType.HUAWEI_HEALTH,
          name: 'Huawei Health',
          description: 'Direct Huawei Health integration',
          isAvailable: await this.checkHuaweiHealthAvailable(),
          isConnected: false,
        });
      }
    }

    // Device sensors - always available as fallback
    this.availableApps.push({
      type: HealthAppType.DEVICE_SENSORS,
      name: 'Device Sensors',
      description: 'Built-in step counter and sensors',
      isAvailable: true,
      isConnected: false,
    });

    // Manual entry - always available
    this.availableApps.push({
      type: HealthAppType.MANUAL,
      name: 'Manual Entry',
      description: 'Manually log your activities',
      isAvailable: true,
      isConnected: false,
    });

    return this.availableApps;
  }

  async requestPermissions(appType: HealthAppType): Promise<boolean> {
    try {
      switch (appType) {
        case HealthAppType.APPLE_HEALTH:
          return await this.requestHealthKitPermissions();
        case HealthAppType.GOOGLE_FIT:
          return await this.requestGoogleFitPermissions();
        case HealthAppType.SAMSUNG_HEALTH:
          return await this.requestSamsungHealthPermissions();
        case HealthAppType.HUAWEI_HEALTH:
          return await this.requestHuaweiHealthPermissions();
        case HealthAppType.DEVICE_SENSORS:
          return await this.requestDeviceSensorPermissions();
        case HealthAppType.MANUAL:
          return true; // No permissions needed
        default:
          return false;
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  async connectApp(appType: HealthAppType): Promise<boolean> {
    const hasPermission = await this.requestPermissions(appType);
    if (!hasPermission) {
      return false;
    }

    try {
      switch (appType) {
        case HealthAppType.APPLE_HEALTH:
          const AppleHealthKit = require('react-native-health').default;
          return await this.initializeHealthKit(AppleHealthKit);
        case HealthAppType.GOOGLE_FIT:
          const GoogleFit = require('react-native-google-fit').default;
          return await this.initializeGoogleFit(GoogleFit);
        case HealthAppType.SAMSUNG_HEALTH:
          // Samsung Health initialization
          return true; // Placeholder
        case HealthAppType.HUAWEI_HEALTH:
          // Huawei Health initialization
          return true; // Placeholder
        case HealthAppType.DEVICE_SENSORS:
          return true; // Always available
        case HealthAppType.MANUAL:
          return true; // Always available
        default:
          return false;
      }
    } catch (error) {
      console.error('App connection failed:', error);
      return false;
    }
  }

  async getTodayActivityData(): Promise<ActivityData | null> {
    if (!this.selectedApp) {
      return null;
    }

    const today = new Date().toISOString().split('T')[0];

    try {
      switch (this.selectedApp) {
        case HealthAppType.APPLE_HEALTH:
          return await this.getHealthKitData(today);
        case HealthAppType.GOOGLE_FIT:
          return await this.getGoogleFitData(today);
        case HealthAppType.SAMSUNG_HEALTH:
          return await this.getSamsungHealthData(today);
        case HealthAppType.HUAWEI_HEALTH:
          return await this.getHuaweiHealthData(today);
        case HealthAppType.DEVICE_SENSORS:
          return await this.getDeviceSensorData(today);
        default:
          return null;
      }
    } catch (error) {
      console.error('Failed to get activity data:', error);
      return null;
    }
  }

  setSelectedApp(appType: HealthAppType) {
    this.selectedApp = appType;
  }

  getSelectedApp(): HealthAppType | null {
    return this.selectedApp;
  }

  getAvailableApps(): HealthApp[] {
    return this.availableApps;
  }

  // Private helper methods
  private async checkGoogleFitAvailable(): Promise<boolean> {
    try {
      // Check if Google Fit app is installed
      return true; // Simplified - in real implementation check package
    } catch {
      return false;
    }
  }

  private async checkSamsungHealthAvailable(): Promise<boolean> {
    try {
      // Check if Samsung Health app is installed
      return true; // Simplified
    } catch {
      return false;
    }
  }

  private async checkHuaweiHealthAvailable(): Promise<boolean> {
    try {
      // Check if Huawei Health app is installed
      return true; // Simplified
    } catch {
      return false;
    }
  }

  // Permission request methods
  private async requestHealthKitPermissions(): Promise<boolean> {
    const AppleHealthKit = require('react-native-health').default;
    const permissions = {
      permissions: {
        read: [
          AppleHealthKit.Constants.Permissions.Steps,
          AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
          AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
          AppleHealthKit.Constants.Permissions.BasalEnergyBurned,
          AppleHealthKit.Constants.Permissions.Workout,
        ],
        write: [],
      },
    };

    return new Promise(resolve => {
      AppleHealthKit.initHealthKit(permissions, (error: any) => {
        resolve(!error);
      });
    });
  }

  private async requestGoogleFitPermissions(): Promise<boolean> {
    const permission = await request(PERMISSIONS.ANDROID.ACTIVITY_RECOGNITION);
    return permission === RESULTS.GRANTED;
  }

  private async requestSamsungHealthPermissions(): Promise<boolean> {
    // Samsung Health specific permissions
    return true; // Placeholder
  }

  private async requestHuaweiHealthPermissions(): Promise<boolean> {
    // Huawei Health specific permissions
    return true; // Placeholder
  }

  private async requestDeviceSensorPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      const permission = await request(
        PERMISSIONS.ANDROID.ACTIVITY_RECOGNITION
      );
      return permission === RESULTS.GRANTED;
    }
    return true; // iOS doesn't need special permission for step counter
  }

  // Health app initialization methods
  private async initializeHealthKit(HealthKit: any): Promise<boolean> {
    // Already initialized in permission request
    return true;
  }

  private async initializeGoogleFit(GoogleFit: any): Promise<boolean> {
    const options = {
      scopes: [
        GoogleFit.Scopes.FITNESS_ACTIVITY_READ,
        GoogleFit.Scopes.FITNESS_BODY_READ,
      ],
    };

    return new Promise(resolve => {
      GoogleFit.authorize(options)
        .then((authResult: any) => {
          if (authResult.success) {
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .catch(() => resolve(false));
    });
  }

  // Data retrieval methods
  private async getHealthKitData(date: string): Promise<ActivityData> {
    const AppleHealthKit = require('react-native-health').default;

    return new Promise((resolve, reject) => {
      const options = {
        startDate: new Date(date).toISOString(),
        endDate: new Date(`${date}T23:59:59`).toISOString(),
      };

      let activityData: ActivityData = {
        date,
        caloriesBurned: 0,
        steps: 0,
        distance: 0,
        source: HealthAppType.APPLE_HEALTH,
      };

      // Get active energy burned
      AppleHealthKit.getActiveEnergyBurned(
        options,
        (err: any, results: any) => {
          if (!err && results.length > 0) {
            activityData.caloriesBurned = results.reduce(
              (sum: number, item: any) => sum + (item.value || 0),
              0
            );
          }

          // Get steps
          AppleHealthKit.getStepCount(options, (err: any, results: any) => {
            if (!err && results.length > 0) {
              activityData.steps = results.reduce(
                (sum: number, item: any) => sum + (item.value || 0),
                0
              );
            }

            // Get distance
            AppleHealthKit.getDistanceWalkingRunning(
              options,
              (err: any, results: any) => {
                if (!err && results.length > 0) {
                  activityData.distance =
                    results.reduce(
                      (sum: number, item: any) => sum + (item.value || 0),
                      0
                    ) / 1000; // Convert to km
                }

                resolve(activityData);
              }
            );
          });
        }
      );
    });
  }

  private async getGoogleFitData(date: string): Promise<ActivityData> {
    const GoogleFit = require('react-native-google-fit').default;

    const options = {
      startDate: new Date(date).toISOString(),
      endDate: new Date(`${date}T23:59:59`).toISOString(),
    };

    const [calories, steps, distance] = await Promise.all([
      GoogleFit.getDailyCalorieSamples(options),
      GoogleFit.getDailyStepCountSamples(options),
      GoogleFit.getDailyDistanceSamples(options),
    ]);

    return {
      date,
      caloriesBurned: calories?.[0]?.calorie || 0,
      steps: steps?.[0]?.steps?.length > 0 ? steps[0].steps[0].value : 0,
      distance: distance?.[0]?.distance || 0,
      source: HealthAppType.GOOGLE_FIT,
    };
  }

  private async getSamsungHealthData(date: string): Promise<ActivityData> {
    // Samsung Health implementation
    return {
      date,
      caloriesBurned: 0,
      steps: 0,
      distance: 0,
      source: HealthAppType.SAMSUNG_HEALTH,
    };
  }

  private async getHuaweiHealthData(date: string): Promise<ActivityData> {
    // Huawei Health implementation
    return {
      date,
      caloriesBurned: 0,
      steps: 0,
      distance: 0,
      source: HealthAppType.HUAWEI_HEALTH,
    };
  }

  private async getDeviceSensorData(date: string): Promise<ActivityData> {
    // Use device's built-in step counter
    // This would use CMPedometer on iOS or Android's SensorManager
    return {
      date,
      caloriesBurned: 0, // Would need to calculate based on steps
      steps: 0, // Get from device sensors
      distance: 0,
      source: HealthAppType.DEVICE_SENSORS,
    };
  }
}

export default HealthAppsManager.getInstance();
