'use strict';

const Homey = require('homey');
const HueDevice = require('../../lib/HueDevice.js');

const CAPABILITIES_MAP = {
  'onoff': 'on',
  'dim': 'bri'
};

module.exports = class DeviceBulb extends HueDevice {
  
  onHueInit() {
    const capabilities = this.getCapabilities();
    this.log('Capabilities:', capabilities.join(', '));
    this.registerMultipleCapabilityListener(capabilities, this.onMultipleCapabilities.bind(this));
  }
  
  onPoll({ device }) {   
    super.onPoll(...arguments);
    if(!device.state) return;
     
    for( const capabilityId in CAPABILITIES_MAP ) {
      if( !this.hasCapability(capabilityId) ) continue;
      
      const propertyId = CAPABILITIES_MAP[capabilityId];
      const propertyValue = device.state[propertyId];
      const convertedValue = this.constructor.convert(capabilityId, 'get', propertyValue);
      
      if( this.getCapabilityValue('onoff') === false && capabilityId === 'dim' ) continue;
      this.setCapabilityValue(capabilityId, convertedValue).catch(err => {
        this.error(`Error setting capability ${capabilityId} to value ${convertedValue} (${propertyValue})`);
      });
    }
    
    // cleanup
    device = null;
  }
  
  onRenamed(name) {
    if( !this.bridge ) return;
    
    const { id } = this;
    this.bridge.setLightName({
      id,
      name,
    }).catch(this.error);
  }
  
  async setLightState(state) {  
    return this.bridge.setLightState({
      state,
      id: this.id,
    });    
  }
  
  async onMultipleCapabilities(valueObj, optsObj) {
    //this.log('onMultipleCapabilities', valueObj, optsObj)
    
    const state = {
      effect: 'none',
      alert: 'none',
    };
    
    // Calculate capabilities  
    if( typeof valueObj.dim === 'number' ) {
      valueObj.onoff = valueObj.dim > 0;  
    } else {
      if( typeof valueObj.onoff === 'undefined' ) {
        valueObj.onoff = true;
      }
    }

    // Calculate values and set local state
    for( let capabilityId in CAPABILITIES_MAP ) {
      if( !this.hasCapability(capabilityId) ) continue;
      
      const propertyId = CAPABILITIES_MAP[capabilityId];
      const capabilityValue = ( typeof valueObj[capabilityId] !== 'undefined' )
        ? valueObj[capabilityId] 
        : this.getCapabilityValue(capabilityId);
      
      const convertedValue = this.constructor.convert(capabilityId, 'set', capabilityValue);
      if( convertedValue === null ||  isNaN(convertedValue) === true) continue;

      state[propertyId] = convertedValue;
      this.setCapabilityValue(capabilityId, capabilityValue).catch(this.error);
    }
    
    if(!Object.keys(state).length) return;
    
    // Add transition
    for( let key in optsObj ) {
      if( typeof optsObj[key].duration === 'number' ) {
        state['transitiontime'] = optsObj[key].duration / 100;
      }
    }
    
    //this.log('State:', state);
    
    // Sync state to bulb
    return this.setLightState(state);
  }

  static convert( capabilityId, direction, value ) {
    if( capabilityId === 'onoff' ) {
      if( direction === 'get' ) {
        return value === true;
      } else if( direction === 'set' ) {
        return value === true;
      }
    } else if( capabilityId === 'dim' || capabilityId === 'light_saturation'  ) {      
      if( direction === 'get' ) {
        value = Math.max(0, value);
        value = Math.min(254, value);
        return value / 254;
      } else if( direction === 'set' ) {
        return Math.ceil( value * 254 );
      }
    } else {
      return value;
    }
  }
}