'use babel';

import { EventEmitter } from 'events';
import { platform } from 'os';
import meta from '../package.json';

export const config = {
	customArguments: {
		title: 'Arguments',
		description: 'Arguments to use with fpc',
		type: 'string',
		'default': '-Mtp',
		order: 0
	},
	fpcPath: {
		title: 'Execute FPC like',
		description: 'if no path variable is set this needs to be the full path (a.e. C:\FPC\3.0.0\bin\i386-win32\fpc.exe)',
		type: 'string',
		'default': 'fpc',
		order: 1
	}
};

export function provideBuilder() {
	const errorMatches = [
		'\n(?<file>([^\n]+.pas))\\((?<line>[0-9]+),(?<col>[0-9]+)\\)\\s+Fatal:\\s(?<message>([^\n]+))',
		'\n(?<file>([^\n]+.pas))\\((?<line>[0-9]+),(?<col>[0-9]+)\\)\\s+Error:\\s(?<message>([^\n]+))'
	];
	const warningMatches = [
		'\n(?<file>([^\n]+.pas))\\((?<line>[0-9]+),(?<col>[0-9]+)\\)\\s+Warning:\\s(?<message>([^\n]+))',
		'\n(?<file>([^\n]+.pas))\\((?<line>[0-9]+),(?<col>[0-9]+)\\)\\s+Note:\\s(?<message>([^\n]+))'
	];

	return class FpcProvider extends EventEmitter {
		constructor(cwd) {
			super();
			this.cwd = cwd;
			atom.config.observe('build-fpc.customArguments', () => this.emit(
				'refresh'));
		}

		getNiceName() {
			return 'FPC';
		}

		isEligible() {
			var textEditor = atom.workspace.getActiveTextEditor();
			if (!textEditor || !textEditor.getPath()) {
				return false;
			}
			var path = textEditor.getPath();
			return path.endsWith('.pas');
		}

		settings() {
			const cwdPath = '{FILE_ACTIVE_PATH}';
			const customArguments = atom.config.get(meta.name +
				'.customArguments').trim().split(' ');
			var args = [customArguments, '{FILE_ACTIVE}'];
			var argsExec = [customArguments, '{FILE_ACTIVE}',
				' & {FILE_ACTIVE_NAME_BASE}.exe'
			];
			return [{
				name: 'FPC build',
				exec: 'fpc',
				args: args,
				cwd: cwdPath,
				sh: false,
				errorMatch: errorMatches,
				warningMatch: warningMatches,
				atomCommandName: 'fpc:build'
			}, {
				name: 'FPC build and execute',
				exec: 'fpc',
				args: argsExec,
				cwd: cwdPath,
				sh: true,
				errorMatch: errorMatches,
				warningMatch: warningMatches,
				atomCommandName: 'fpc:build-execute'
			}, ];
		}
	};
}
