'use strict';

const Homey = require('homey');
const HueDriver = require('../../lib/HueDriver.js');

const DEFAULT_ICON	= 'LCT001';
const CAPABILITIES_MAP = {
	'on/off light': [ 'onoff' ],
	'on/off plug-in unit': [ 'onoff' ],
	'dimmable light': [ 'onoff', 'dim' ],
	'dimmable plug-in unit': [ 'onoff', 'dim' ],
	'color temperature light': [ 'onoff', 'dim', 'light_temperature' ],
	'color light': [ 'onoff', 'dim', 'light_hue', 'light_saturation' ],
	'extended color light': [ 'onoff', 'dim', 'light_hue', 'light_saturation', 'light_temperature', 'light_mode' ],
}
const ICONS_MAP = {
	'LCT001': 'LCT001',
	'LCT007': 'LCT001',
	'LCT002': 'LCT002',
	'LCT003': 'LCT003',
	'LCT012': 'LCT012',
	'LLC001': 'LLC001',
	'LLC010': 'LLC010',
	'LLC011': 'LLC011',
	'LLC012': 'LLC011',
	'LLC006': 'LLC010',
	'LLC007': 'LLC007',
	'LLC013': 'LLC013',
	'LWB004': 'LCT001',
	'LWB006': 'LWB006',
	'LWB007': 'LCT001',
	'LWB010': 'LWB006',
	'LWB014': 'LWB006',
	'LLM001': DEFAULT_ICON,
	'LLM010': DEFAULT_ICON,
	'LLM011': DEFAULT_ICON,
	'LLM012': DEFAULT_ICON,
	'LLC020': 'LLC020',
	'LTW012': 'LCT012',
	'LCF005': 'LCF005',
	'LCS001': 'LCS001',
	'LCT024': 'LCT024',
	'LST001': 'LST001',
	'LST002': 'LST001',
	'LST003': 'LST001',
	'LWF001': 'LWF001',
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