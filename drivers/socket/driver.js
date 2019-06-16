'use strict';

const Homey = require('homey');
const HueDriver = require('../../lib/HueDriver.js');

const DEFAULT_ICON	= 'socket';
const CAPABILITIES_MAP = {
	'on/off plug-in unit': [ 'onoff' ],
}
const ICONS_MAP = {
	'Plug 01': DEFAULT_ICON,
}

module.exports = class DriverBulb extends HueDriver {
  
  static get HUE_TYPE() {
    return 'light';
  }
  
  static onPairGetDevices({ bridge }) {
    return bridge.getLights.bind(bridge);
  }
  
  static onPairListDevice({ bridge, device }) {
    const obj = {};
    
    const type = device.type.toLowerCase();
    const modelid = device.modelid;
    
    const capabilities = CAPABILITIES_MAP[type];
    if( !capabilities ) return null;
    obj.capabilities = capabilities;
    
    const icon = ICONS_MAP[modelid];
    if( icon ) obj.icon = `/icons/${icon}.svg`;
    
    return obj;
  }
  
  onInitFlow() {
		new Homey.FlowCardAction('shortAlert')
			.register()
			.registerRunListener( args => args.device.shortAlert() );
			
		new Homey.FlowCardAction('longAlert')
			.register()
			.registerRunListener( args => args.device.longAlert() );
		
		new Homey.FlowCardAction('startColorLoop')
			.register()
			.registerRunListener( args => args.device.startColorLoop() );
			
		new Homey.FlowCardAction('stopColorLoop')
			.register()
			.registerRunListener( args => args.device.stopColorLoop() );
  }
}