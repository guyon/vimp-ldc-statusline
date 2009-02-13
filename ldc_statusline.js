//--------------------------------------------------------------------
// :NOTE  {{{1
//    Vimperator 1.2 plugin
//
//    Livedoorクリップの登録状況をステータスラインの先頭に表示する
//
// See：
//   【ステータスラインを変更する方法】
//    http://d.hatena.ne.jp/janus_wel/20081028/1225230512
// Require: livedoor clip IncSearch extension
//    https://addons.mozilla.org/ja/firefox/addon/5542
//
// Usage:
//  【準備】
//    予めlivedoor clip IncSearchを使って同期しておく。
//    ※LDCのAPIではerrorの発生やレスポンスが遅い可能性があるので
//    　今回は使用を見送った。
//
//  【状態】
//    <!> ローカルにClipデータファイルが見つからない
//    <*> 既に登録済みのURL
//    <-> 未登録のURL
//
// Last Change: 2009-02-13
//
// }}}1
//-------------------------------------------------------------------

liberator.plugins.ldcStatusline = function () {
    var clipInit = function () {
        var clip = document.getElementById('liberator-statusline-field-clip');
        if (!clip) {
            var panel = document.createElement('statusbarpanel');
            var clip = document.getElementById('liberator-statusline-field-tabcount')
                                   .cloneNode(false);
            clip.setAttribute('id', 'liberator-statusline-field-clip');
            panel.appendChild(clip);
            document.getElementById('status-bar').insertBefore(
                panel,
                document.getElementById('liberator-statusline')
            );
        }

        return clip;
    };

    var clip = clipInit();

    var file = Components.classes["@mozilla.org/file/directory_service;1"]
                .getService(Components.interfaces.nsIProperties)
                .get("ProfD", Components.interfaces.nsIFile);
    file.append('livedoorclip_incsearch');
    file.append('bookmark.sqlite');

    if( !file.exists()){
        clip.setAttribute('value', '<!>');
    }else{
        var storageService = Components.classes["@mozilla.org/storage/service;1"]
                                .getService(Components.interfaces.mozIStorageService);
        var mDBConn = storageService.openDatabase(file);
        var statement = mDBConn.createStatement("SELECT count(*) as cnt FROM bookmark WHERE url = ?1");
        statement.bindUTF8StringParameter(0,liberator.buffer.URL);

        var clipStatus = "<->";
        while (statement.executeStep()) {
            var cnt = statement.getUTF8String("cnt");
            if(cnt > 0) clipStatus = "<*>";
        }
        clip.setAttribute('value', clipStatus);
    }
}
liberator.autocommands.add(
    'LocationChange',
    '.*',
    'js liberator.plugins.ldcStatusline()'
);
