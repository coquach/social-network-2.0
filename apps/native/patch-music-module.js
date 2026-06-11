const fs = require('fs');
const https = require('https');
const path = 'e:/social-network-2.0/node_modules/react-native-track-player/android/src/main/java/com/doublesymmetry/trackplayer/module/MusicModule.kt';

https.get('https://raw.githubusercontent.com/doublesymmetry/react-native-track-player/v4.1.1/android/src/main/java/com/doublesymmetry/trackplayer/module/MusicModule.kt', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        // Now safely patch it
        let lines = data.split('\n');
        for (let i = 0; i < lines.length; i++) {
            // Find function signatures that end with = scope.launch {
            if (lines[i].includes('fun ') && lines[i].includes(') = scope.launch {')) {
                lines[i] = lines[i].replace(') = scope.launch {', ') { scope.launch {');
                // find matching closing brace
                let braceCount = 1;
                for (let j = i + 1; j < lines.length; j++) {
                    if (lines[j].includes('{')) braceCount += (lines[j].match(/\{/g) || []).length;
                    if (lines[j].includes('}')) braceCount -= (lines[j].match(/\}/g) || []).length;
                    
                    if (braceCount === 0) {
                        lines[j] = lines[j].replace('}', '} }');
                        break;
                    }
                }
            } else if (lines[i].includes('fun updateMetadataForTrack') && lines[i].includes('=') && lines[i+1] && lines[i+1].includes('scope.launch {')) {
                // Handle the multiline one
                lines[i] = lines[i].replace('=', '{');
                // The brace ends at line 352 approximately
                let braceCount = 0;
                for (let j = i + 1; j < lines.length; j++) {
                    if (lines[j].includes('{')) braceCount += (lines[j].match(/\{/g) || []).length;
                    if (lines[j].includes('}')) braceCount -= (lines[j].match(/\}/g) || []).length;
                    
                    if (braceCount === 0 && lines[j].includes('}')) {
                        lines[j] = lines[j].replace('}', '} }');
                        break;
                    }
                }
            }
        }
        
        let result = lines.join('\n');
        
        // Fix Bundle? type mismatch errors
        result = result.replace(
            'callback.resolve(Arguments.fromBundle(musicService.tracks[index].originalItem))',
            'callback.resolve(Arguments.fromBundle(musicService.tracks[index].originalItem ?: Bundle()))'
        );
        result = result.replace(
            'callback.resolve(Arguments.fromList(musicService.tracks.map { it.originalItem }))',
            'callback.resolve(Arguments.fromList(musicService.tracks.map { it.originalItem ?: Bundle() }))'
        );
        result = result.replace(
            'musicService.tracks[musicService.getCurrentTrackIndex()].originalItem',
            'musicService.tracks[musicService.getCurrentTrackIndex()].originalItem ?: Bundle()'
        );
        
        fs.writeFileSync(path, result);
        console.log('Restored and patched MusicModule.kt safely.');
    });
}).on('error', err => {
    console.error('Failed to download original file:', err);
});
