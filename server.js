var express = require("express")
var formidable = require('formidable');
var hbs = require('express-handlebars');
var app = express()
var PORT = process.env.PORT || 3000;
var path = require("path")

let FilesTable = new Array()
var FileToView = false;

function saveFilesData(files)
{
    console.log("One file up")
    if(files.imagetoupload instanceof Array) //parę plików
    {
        for(var i=0 ; i<files.imagetoupload.length; i++)
        {
            var data = {id: FilesTable.length+1,path: files.imagetoupload[i].path, name: files.imagetoupload[i].name, size:  files.imagetoupload[i].size, type: files.imagetoupload[i].type, date: files.imagetoupload[i].lastModifiedDate}
            var re = /(?:\.([^.]+))?$/;
            var extension = re.exec(data.path)[1]
            console.log(extension)
            var available = ['ai', 'avi', 'css', 'doc', 'exe', 'gif', 'html', 'jpg', 'mp3', 'pdf', 'ppt', 'rar', 'svg', 'txt', 'xls', 'zip']
            var isExtensionOK = false
            for(var j=0; j<available.length; j++)
            {
                if(extension==available[j]) isExtensionOK = true
            }
            if(isExtensionOK) data.extension = extension;
            else data.extension = "unknown"
            FilesTable.push(data)
        }
    }
    else //jeden plik
    {
        var data = {id: FilesTable.length+1,path: files.imagetoupload.path, name: files.imagetoupload.name, size:  files.imagetoupload.size, type: files.imagetoupload.type, date: files.imagetoupload.lastModifiedDate}
        var re = /(?:\.([^.]+))?$/;
        var extension = re.exec(data.path)[1]
        var available = ['ai', 'avi', 'css', 'doc', 'exe', 'gif', 'html', 'jpg', 'mp3', 'pdf', 'ppt', 'rar', 'svg', 'txt', 'xls', 'zip']
        var isExtensionOK = false
        for(var i=0; i<available.length; i++)
        {
            if(extension==available[i]) isExtensionOK = true
        }
        if(isExtensionOK) data.extension = extension;
        else data.extension = "unknown"
        FilesTable.push(data)
    }
    return 0;
}

app.use(express.urlencoded());
app.use(express.json());

app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({ defaultLayout: null, extname: '.hbs', partialsDir: "views/partials" }));

app.set('view engine', 'hbs');

app.use(express.static(__dirname));

app.get("/", function(req, res){
    var context = {multiupload: true, mode: "multiupload"}
    res.render("index.hbs", context)
})

app.get("/upload", function(req, res){
    var context = {multiupload: true, mode: "multiupload"}
    res.render("index.hbs", context)
})

app.post('/upload', function (req, res) {
    var form = new formidable.IncomingForm();
    console.log("Form recived")
    form.uploadDir = __dirname + '/static/upload'
    form.keepExtensions = true
    form.multiples = true 
    form.parse(req, function (err, fields, files) {
        console.log("Parse started")
        saveFilesData(files)
        console.log("Callback Exited")
    });
    console.log("Form parse exited")
    /*var context = {multiupload: true, mode: "multiupload"}
    res.render("index.hbs", context)*/
    res.redirect("/filemanager")
});

app.get("/filemanager", function(req, res){
    var context = {filemanager: true, mode: "filemanager", FilesList: FilesTable}
    res.render("index.hbs", context)
})

app.post("/filemanager", function(req, res){
    if(req.body.toDelete)
    {
        FilesTable[parseInt(req.body.toDelete)-1] = false
        var context = {filemanager: true, mode: "filemanager", FilesList: FilesTable}
        res.render("index.hbs", context)
    }
    if(req.body.toInfo)
    {
        FileToView = parseInt(req.body.toInfo)
        res.redirect("/info")
    }
    if(req.body.toDownload)
    {
        res.download(FilesTable[parseInt(req.body.toDownload)].path, function(err){
            console.log(err)
        })
    }
})

app.get("/info", function(req, res){
    console.log(FileToView)
    if(FileToView==false) res.redirect("/filemanager")
    else
    {
        var context = {info: true, mode: "info", file: FilesTable[FileToView-1]}
        res.render("index.hbs", context)
    }
})

app.listen(PORT, function () { 
    console.log("start serwera na porcie " + PORT )
})