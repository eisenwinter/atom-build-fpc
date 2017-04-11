'use babel';

import {
  EventEmitter
}
from 'events';
import {
  platform
}
from 'os';
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
			'(?<file>[^\n]+\.pas)\((?<line>\d+),(?<col>\d+)\)\s+Fatal: (?<message>[^\n]*)',
			];
	const warningMatches = [
		'(?<file>[^\n]+\.pas)\((?<line>\d+),(?<col>\d+)\)\s+Warning: (?<message>[^\n]*)',
		'(?<file>[^\n]+\.pas)\((?<line>\d+),(?<col>\d+)\)\s+Note: (?<message>[^\n]*)'
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
      // User settings
      const customArguments = atom.config.get(meta.name +
        '.customArguments').trim().split(' ');
      var args = [customArguments, '{FILE_ACTIVE}'];
      return [{
        name: 'FPC build',
        exec: 'fpc',
        args: args,
        cwd: cwdPath,
        sh: false,
		errorMatch: errorMatches,
		warningMatch: warningMatches,
        atomCommandName: 'fpc:build'
      }];
    }
  };
}
