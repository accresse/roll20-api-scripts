var ClaymoreCrit = ClaymoreCrit || (function() {
	'use strict';

	var version = '0.0.1',
	debug = false,

	checkInstall = function() {
		log('-=> ClaymoreCrit v'+version+' <=-');

		//add prior level effects
		effects[10][18]=effects[10][16].concat(effects[10][17]).concat(effects[10][17]);
		effects[10][19]=effects[10][16].concat(effects[10][19]);
		effects[10][20]=effects[10][16].concat(effects[10][20]);

		effects[1][18]=effects[1][16].concat(effects[1][17]).concat(effects[1][17]);
		effects[1][19]=effects[1][16].concat(effects[1][19]);
		effects[1][20]=effects[1][18].concat(effects[1][20]);

		effects[3][18]=effects[3][16].concat(effects[3][17]).concat(effects[3][17]);
		effects[3][19]=effects[3][16].concat(effects[3][19]);
		effects[3][20]=effects[3][18].concat(effects[3][20]);

		effects[6][18]=effects[6][16].concat(effects[6][17]).concat(effects[6][17]);
		effects[6][19]=effects[6][16].concat(effects[6][19]);
		effects[6][20]=effects[6][18].concat(effects[6][20]);

		//add 'always effects'
		for(var i=8; i<=15; i++) {
			effects[10][i]=['Always: -10 UP','Always: KD'].concat(effects[10][i]);
			effects[1][i]=['Always: 1/2 move'].concat(effects[1][i]);
			effects[3][i]=['Always: -10 [[1t[claymore-crit-body-penalty]]]'].concat(effects[3][i]);
			effects[6][i]=['Always: -10 attacks and fine motor'].concat(effects[6][i]);
		}
		for(var i=16; i<=20; i++) {
			effects[10][i]=['Always: KO [[d4]] days', 'Always: -20 UP'].concat(effects[10][i]);
			effects[1][i]=['Always: -10 defense, agl, running, leg skills', 'Always: No move', 'Always: Stun 1 rd'].concat(effects[1][i]);
			effects[3][i]=['Always: No attack', 'Always: 1/4 move', 'Always: Stun 1 rd'].concat(effects[3][i]);
			effects[6][i]=['Always: Useless','Always: -10 attacks and fine motor','Always: Stun 1 rd'].concat(effects[6][i]);
		}

		//copy effects to duplicate location rolls
		effects[2]=effects[1];
		effects[4]=effects[3];
		effects[5]=effects[3];
		effects[7]=effects[6];
		effects[8]=effects[6];
		effects[9]=effects[6];

		createCritTables();
	},
	esRE = function (s) {
	  var escapeForRegexp = /(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\||\.|\^|\$)/g;
	  return s.replace(escapeForRegexp,"\\$1");
	},
	HE = (function(){
		var entities={
				//' ' : '&'+'nbsp'+';',
				'<' : '&'+'lt'+';',
				'>' : '&'+'gt'+';',
				"'" : '&'+'#39'+';',
				'@' : '&'+'#64'+';',
				'{' : '&'+'#123'+';',
				'|' : '&'+'#124'+';',
				'}' : '&'+'#125'+';',
				'[' : '&'+'#91'+';',
				']' : '&'+'#93'+';',
				'"' : '&'+'quot'+';'
			},
			re=new RegExp('('+_.map(_.keys(entities),esRE).join('|')+')','g');
		return function(s){
		  return s.replace(re, function(c){ return entities[c] || c; });
		};
	}()),
	sizes = {
			't': {name: 'Tiny', numeric: -2},
			'S': {name: 'Small', numeric: -1},
			'M': {name: 'Medium', numeric: 0},
			'L': {name: 'Large', numeric: 1},
			'H': {name: 'Huge', numeric: 2},
			'G': {name: 'Giant', numeric: 3},
			'T': {name: 'Titan', numeric: 4},
	},
	weaponRolls = {
		'-2': '2d3',
		'-1': '2d4',
		'0': '2d6',
		'1': '2d10',
		'2': '2d12',
		'3': '2d12+4',
	},
	energyRolls = {
		'0': '2d3',
		'25': '2d4',
		'50': '2d6',
		'75': '2d10',
		'100': '2d12',
		'125': '2d12',
		'150': '2d12+4',
	},
	locations = {
	  '10':'Head',
	  '1':'Right Leg',
	  '2':'Left Leg',
	  '3':'Body',
	  '4':'Body',
	  '5':'Body',
	  '6':'Left Arm',
	  '7':'Left Arm',
	  '8':'Right Arm',
	  '9':'Right Arm'
	},
	//effects[location][severity]
	effects = {
		'10':{
			'2':['-10 UP'],
			'3':['KD'],
			'4':['-5 UP','KD'],
			'5':['Dizzy (-20 UP [[d4]] rds)'],
			'6':['Stun [[d4]] rds'],
			'7':['KO [[d4]] rds'],
			'8':['Deaf [[2d4]] rds'],
			'9':['-10 UP', 'no KD', 'Severe'],
			'10':['Blind 1 eye (permanent, -10 BWS)'],
			'11':['Blind'],
			'12':['-10 UP', 'Stun [[3d4]] rds'],
			'13':['-10 UP','KD'],
			'14':['-20 UP','KD'],
			'15':['KO [[2d6]] mins'],
			'16':['-20 UP (permanent)','Stun [[2d6]] rds'],
			'17':['-[[d4]] [[1t[claymore-crit-head-stat]]] (permanent)'],
			'18':[],
			'19':['Death in [[2d3]] rds'],
			'20':['Instant death'],
		},
		'1':{
			'2':['None'],
			'3':['-25 run check'],
			'4':['-5 defense, agl, running, leg skills'],
			'5':['3/4 move [[2d4]] mins'],
			'6':['3/4 move [[2d4]] mins AND -5 defense, agl, running, leg skills'],
			'7':['Useless (negated by Tend Wounds) AND -10 defense, agl, running, leg skills (negated by Tend Wounds)'],
			'8':['-5 defense, agl, running, leg skills'],
			'9':['-10 defense, agl, running, leg skills'],
			'10':['-10 defense, agl, running, leg skills','KD'],
			'11':['1/2 move','KD'],
			'12':['-10 defense, agl, running, leg skills','Stun [[2d4]] rds'],
			'13':['-10 defense, agl, running, leg skills (negated by Tend Wounds)', '-10 defense, agl, running, leg skills (permanent)','KD'],
			'14':['-10 defense, agl, running, leg skills','Stun 1 rd'],
			'15':['No move', '-10 UP'],
			'16':['-20 defense, agl, running, leg skills (permanent)','Stun [[2d4]] rds'],
			'17':['1/2 move (permanent)'],
			'18':[],
			'19':['Death in [[2d6]] rds'],
			'20':['Death in [[2d3]] rds'],
		},
		'3':{
			'2':['None'],
			'3':['None'],
			'4':['20 run check'],
			'5':['-10 [[1t[claymore-crit-body-penalty]]]'],
			'6':['KD'],
			'7':['-5 [[1t[claymore-crit-body-penalty]]]','KD'],
			'8':['-10 [[1t[claymore-crit-body-penalty]]]'],
			'9':['KD'],
			'10':['Stun [[d6]] rds'],
			'11':['-1 attack','KD'],
			'12':['-10 [[1t[claymore-crit-body-penalty]]]','Stun [[2d4]] rds'],
			'13':['-10 [[1t[claymore-crit-body-penalty]]]','Stun [[d6]] rds'],
			'14':['(-10,-10) [[1t[claymore-crit-body-penalty]]]'],
			'15':['-1 attack','KO [[2d4]] rds'],
			'16':['-20 [[1t[claymore-crit-body-penalty]]] (permanent)','Stun [[2d4]] rds'],
			'17':['-[[d4]] [[1t[claymore-crit-body-stat]]]'],
			'18':[],
			'19':['Death in [[2d6]] rds'],
			'20':['Death in [[2d3]] rds'],
		},
		'6':{
			'2':['None'],
			'3':['Drop item'],
			'4':['-5 attacks and fine motor'],
			'5':['-10 attacks and fine motor'],
			'6':['-10 attacks and fine motor','Drop item'],
			'7':['Useless (negated by Tend Wounds) AND -10 attacks and fine motor (negated by Tend Wounds)'],
			'8':['-5 attacks and fine motor'],
			'9':['-10 attacks and fine motor','Drop item'],
			'10':['-5 attacks and fine motor','-10 attacks and fine motor (negated by Tend Wounds)'],
			'11':['Useless'],
			'12':['-10 attacks and fine motor','Stun [[2d4]] rds'],
			'13':['-15 attacks and fine motor (negated by Tend Wounds)','-10 attacks and fine motor (permanent)'],
			'14':['Useless','-10 UP'],
			'15':['Useless','-10 UP','KD'],
			'16':['-20 attacks and fine motor (permanent)','Stun [[2d4]] rds'],
			'17':['Useless (permanent)'],
			'18':[],
			'19':['Death in [[2d6]] rds'],
			'20':['Death in [[2d3]] rds'],
		}
	},
	//0-100 = Minor, 101-200 = Major, 201-300 = Severe
	bleeding = {
		'2':40,
		'3':60,
		'4':80,
		'5':120,
		'6':140,
		'7':160,
		'8':160,
		'9':180,
		'10':180,
		'11':200,
		'12':200,
		'13':220,
		'14':240,
		'15':240,
		'16':260,
		'17':280,
		'18':300,
		'19':300,
		'20':300
	},
	typeMod = {
		'B': {'bleeding':function(level){ return Math.max(level-100,0); }, 'effects': ['25% chance KD'] },
		'S': {'bleeding':function(level){ return level; }, 'effects': [] },
		'P': {'bleeding':function(level){ return Math.min(level+50,300); }, 'effects': [] },
		'A': {'bleeding':function(level){ return Math.max(level-100,0); }, 'effects': ['25% chance blind'] },
		'C': {'bleeding':function(level){ return 0; }, 'effects': ['25% chance -10 attacks and fine motor [[2d6]] rds'] },
		'E': {'bleeding':function(level){ return Math.max(level-200,0); }, 'effects': ['10% chance on fire'] },
		'F': {'bleeding':function(level){ return Math.max(level-200,0); }, 'effects': ['25% chance on fire'] }
	},
	//msg.content = '!command --flag1 --flag2 value'
	parseCommand = function(msg) {
		var command = {'msg': msg};

		//args = ['!command','flag1', 'flag2 value']
		var args = msg.content.split(/\s+--/);
		command['command'] = args.shift();

		var cmd;
		//args = ['flag1', 'flag2 value']
		if(args.length>0){
			while(cmd=args.shift()) {
				//param = [['flag1'],['flag2','value']]
				var param = cmd.split(/\s+/);
				if(param.length>1) {
					command[param[0]]=param[1];
				}
				else {
					command[param[0]]=true;
				}
			}
		}
		return command;
	},

	handleInput = function(msg_orig) {
		var msg = _.clone(msg_orig);

		if (msg.type !== "api" ) {
			return;
		}

		var command = parseCommand(msg);
		switch(command['command']) {
			case '!claymore-crit':
				claymoreCrit(command);
		}
	},

	getValueOrRoll = function(command, key) {
		var value = command[key];

		if(value.charAt(0)=='$') {
			var rollNum=value.charAt(3);
			value = command.msg.inlinerolls[rollNum];//.results.total;
		}
		return value;
	},
	calculateSeverity = function(command) {
		var damageType = command['type'];

		var severity;
		if ('energy-dmg-max' in command && 'energy-target-hp' in command){
			var maxDmg = command['energy-dmg-max'];
			var targetHp = command['energy-target-hp'];
			var nearest25 = Math.floor(4*maxDmg/targetHp)*25;
			nearest25 = Math.min(Math.max(nearest25,0),150);
			severity = energyRolls[''+nearest25];

			claymoreSendChat(command['msg'].who,'Calculating crit for type '+damageType+' energy attack at '+nearest25+'%...');
		}
		else {
			if(!('weapon-size' in command)) command['weapon-size']='M';
			var weaponSize = command['weapon-size'];
			var weaponSizeObj = sizes[weaponSize.charAt(0)];

			if(!('weapon-target-size' in command)) command['weapon-target-size']='M';
			var targetSize = command['weapon-target-size'];
			var targetSizeObj=sizes[targetSize];

			var weaponDiff = weaponSizeObj.numeric - targetSizeObj.numeric;
			weaponDiff = Math.max(Math.min(weaponDiff,3),-2);

			severity = weaponRolls[weaponDiff];
			var weaponSizeMod='';
			if(weaponSize.length>1) {
				switch(weaponSize.charAt(1)){
					case '+':
						severity = severity + '+1';
						weaponSizeMod='+';
						break;
					case '-':
						severity = severity + '-1';
						weaponSizeMod='-';
						break;
					default:
						severity = severity;
						weaponSizeMod='';
				}
			}

			claymoreSendChat(command['msg'].who,'Calculating crit for '+weaponSizeObj.name+weaponSizeMod+' / type '+damageType+' weapon vs. '+targetSizeObj.name+' creature...');
		}
		return severity;
	},
	claymoreCrit = function(command) {
		if('help' in command || !('type' in command)) {
			claymoreCritUsage();
		}
		else {
			var location = ('location' in command) ? command['location'] : 'd10';
			var severity = ('severity' in command) ? command['severity'] : calculateSeverity(command);
			sendChat('ClaymoreCrit',command['type']+': severity=[['+severity+']] location=[['+location+']] bleeding=[[d100]]', critFormatter);
		}
	},
	claymoreCritUsage = function() {
		claymoreSendChat('ClaymoreCrit','usage: !claymore-crit --type* [B,S,P,A,C,E,F] --weapon-size [size|M] --weapon-target-size [size|M] --energy-dmg-max [dmg] --energy-target-hp [hp] --location [1-10|d10] --severity [1-20|roll]');
	},
	critFormatter = function(ops) {
		log(ops);
		//parse message
		var type = ops[0].content.charAt(0).toUpperCase();
		var severity = Math.min(Math.max(ops[0].inlinerolls[0].results.total,2),20);
		var location = ops[0].inlinerolls[1].results.total;
		var bleedingRoll = ops[0].inlinerolls[2].results.total;
		log("bleedingRoll: "+bleedingRoll);

		//base critical effects
		var critEffects = [].concat(effects[location][severity]);

		//additional effects based on damage type
		var typeEffects = typeMod[type]['effects'];
		critEffects = critEffects.concat(typeEffects);

		//calculate severity of bleeding
		var bleedingDescription;
		var bleedingSeverity = bleeding[severity];
		log("bleedingSeverity: "+bleedingSeverity);
		var bleedingSeverityMod = typeMod[type]['bleeding'](bleedingSeverity);
		log("bleedingSeverityMod: "+bleedingSeverityMod);
		var bleedingChance = bleedingSeverityMod % 100;
		log("bleedingChance: "+bleedingChance);
		if(bleedingSeverityMod>0 && bleedingChance==0) {
			bleedingChance=100;
		}
		log("bleedingChance: "+bleedingChance);
		if(bleedingRoll>bleedingChance) {
			bleedingSeverityMod=Math.max(0,bleedingSeverityMod-100);
		}
		log("bleedingSeverityMod: "+bleedingSeverityMod);
		if(bleedingSeverityMod>200) {
			bleedingDescription='Severe';
		}
		else if(bleedingSeverityMod>100) {
			bleedingDescription='Major';
		}
		else if(bleedingSeverityMod>0) {
			bleedingDescription='Minor';
		}

		var message = '<div style="border: 1px solid #888;border-radius:5px; padding: 1px 3px;background-color:#ff9999">';
		message += '<div><b>Summary:</b> Crit is a '+formatDiceRoll(ops[0].inlinerolls[0])+' in the '+formatDiceRoll(ops[0].inlinerolls[1])+'</div>';
		message += '<div><b>Type:</b> '+type+'</div>';
		message += '<div><b>Location:</b> '+locations[location]+'</div>';
		message += '<div><b>Effects:</b> '+formatEffects(critEffects)+'</div>'
		message += '<div><b>Bleeding '+formatDiceRoll(ops[0].inlinerolls[2])+':</b> '+bleedingDescription+'</div>';
		message += '</div>'
		claymoreSendChat('ClaymoreCrit',message);
	},
	formatEffects = function(effectList) {
		var list = '<span><ul>';
		_.each(effectList, function(effect){list += '<li>'+effect+'</li>';});
		list += '</ul></span>';
		return list;
	},
	formatDiceRoll = function(roll) {

		return '<span class="inlinerollresult showtip tipsy" '+
					 'style="min-width:1em;display: inline-block; border: 2px solid; background-color: #FEF68E;color: #404040; font-weight:bold;padding: 0px 3px;cursor: help" '+
					 ' title="'+
		HE(HE(
			'<span style="color:white;">Rolling '+roll.expression+' = ('+formatDiceParts(roll)+') </span>'
		))+'">'+roll.results.total+'</span>';
	},
	formatDiceParts = function(roll) {
		var results = roll.results.rolls[0];
		if('results' in results) {
			return _.map(results.results, function(val){ return val['v']; }).join(' + ');
		}
		else {
			return roll.expression;
		}
	},
	claymoreSendChat = function(from, msg, callback) {
		if(debug) {
			log(from+': '+msg);
		} else {
			sendChat(from, msg, callback);
		}
	},
	createCritTables = function () {
		createTable('claymore-crit-head-stat',['Rc','PS','Wit']);
		createTable('claymore-crit-body-stat',['Str','Dex','Con']);
		createTable('claymore-crit-body-penalty',['attacks and fine motor','defense, agl, running, leg skills']);
	},
	createTable = function(tableName, items) {
		var tables=findObjs({type: 'rollabletable', name: tableName});
		if(!tables.length) {
			log('creating table: '+tableName);
			var table=createObj('rollabletable',{name: tableName});
			_.each(items, function(item) {
				createObj('tableitem',{_rollabletableid: table.id, name: item, weight: 1});
			});

		}
	},

	unitTest = function() {
		debug=true;
		/**
		log(parseCommand({content:'!claymore-crit --flag --flag2 value2'}));
		claymoreCrit({'command': '!claymore-crit', 'help':'true'});
		claymoreCrit({'command': '!claymore-crit', 'energy-dmg-max':'true'});
		claymoreCrit({'command': '!claymore-crit'});
		claymoreCrit({'command': '!claymore-crit', 'location': 0});
		claymoreCrit({'command': '!claymore-crit', 'weapon-target-size': 'L'});
		claymoreCrit({'command': '!claymore-crit', 'weapon-size': 'M+'});
		claymoreCrit({'command': '!claymore-crit', 'weapon-size': 'L-'});
		claymoreCrit({'command': '!claymore-crit', 'weapon-size': 'Sx'});
		claymoreCrit({'command': '!claymore-crit', 'location': '0'});
		claymoreCrit({'command': '!claymore-crit', 'severity': '4', 'location': '0'});
		claymoreCrit({'command': '!claymore-crit', 'type': 'B', 'weapon-size': 'T+', 'weapon-target-size': 't'});
		claymoreCrit({'command': '!claymore-crit', 'type': 'F', 'energy-dmg-max': '12', 'energy-target-hp': '50'});
		claymoreCrit({'command': '!claymore-crit', 'type': 'F', 'energy-dmg-max': '13', 'energy-target-hp': '50'});
		claymoreCrit({'command': '!claymore-crit', 'type': 'F', 'energy-dmg-max': '24', 'energy-target-hp': '50'});
		claymoreCrit({'command': '!claymore-crit', 'type': 'F', 'energy-dmg-max': '25', 'energy-target-hp': '50'});
		claymoreCrit({'command': '!claymore-crit', 'type': 'F', 'energy-dmg-max': '55', 'energy-target-hp': '50'});
		claymoreCrit({'command': '!claymore-crit', 'type': 'F', 'energy-dmg-max': '126', 'energy-target-hp': '100'});
		claymoreCrit({'command': '!claymore-crit', 'type': 'F', 'energy-dmg-max': '1000', 'energy-target-hp': '50'});
		claymoreCrit({'msg':{'who':'UnitTest'},'command': '!claymore-crit', 'type': 'F', 'energy-dmg-max': '1000', 'energy-target-hp': '50'});
		**/
		claymoreCrit({'msg':{'who':'UnitTest'},'command': '!claymore-crit', 'type': 'S', 'location': '10', 'severity': '18'});
		debug=false;
	},

	registerEventHandlers = function() {
		on('chat:message', handleInput);
	}

	return {
		CheckInstall: checkInstall,
		RegisterEventHandlers: registerEventHandlers,
		UnitTest: unitTest
	};
}());

on("ready",function(){
	'use strict';

	ClaymoreCrit.CheckInstall();
	ClaymoreCrit.RegisterEventHandlers();
	//ClaymoreCrit.UnitTest();
});