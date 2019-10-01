var fs = require('fs');
var path = require('path');
var { spawn, spawnSync } = require('child_process');
var debug = require('debug')('gnome');

var schemaName = 'org.gnome.shell.extensions.cast-to-tv';
var schemaDir = path.join(__dirname + '/../schemas');
var isSchema = fs.existsSync(`${schemaDir}/gschemas.compiled`);
debug(`Local settings schema available: ${isSchema}`);

var isRemoteVisible = null;

var gnome =
{
	loadSchema: function(customName, customPath)
	{
		schemaName = customName;
		schemaDir = customPath;

		isSchema = fs.existsSync(`${customPath}/gschemas.compiled`);
		debug(`Custom settings schema available: ${isSchema}`);
	},

	setSetting: function(setting, value)
	{
		var args = ['set', schemaName, setting, value];
		if(isSchema) args.unshift('--schemadir', schemaDir);

		debug(`Set ${setting}: ${value}`);
		spawn('gsettings', args);
	},

	getSetting: function(setting)
	{
		var args = ['get', schemaName, setting];
		if(isSchema) args.unshift('--schemadir', schemaDir);

		var gsettings = spawnSync('gsettings', args);
		var value = String(gsettings.stdout).replace(/\n/, '').replace(/\'/g, '');
		debug(`Get ${setting}: ${value}`);

		return value;
	},

	getBoolean: function(setting)
	{
		var value = this.getSetting(setting);
		return (value === 'true' || value === true) ? true : false;
	},

	getJSON: function(setting)
	{
		var value = this.getSetting(setting);
		return JSON.parse(value);
	},

	showRemote: function(enable)
	{
		this.setSetting('chromecast-playing', enable);
		isRemoteVisible = enable;
	},

	showMenu: function(enable)
	{
		this.setSetting('service-enabled', enable);
	},

	isRemote: function()
	{
		isRemoteVisible = (isRemoteVisible === true || isRemoteVisible === false) ?
			isRemoteVisible : this.getBoolean('chromecast-playing');

		return isRemoteVisible;
	}
}

module.exports = gnome;
