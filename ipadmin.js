var passport=require('passport');
var LocalStrategy=require('passport-local').Strategy;
var flash=require('connect-flash');
var bodyParser=require('body-parser');
var cookieParser=require('cookie-parser');
var session=require('express-session');

var IPAdmin=module.exports=function(){}

IPAdmin.prototype.init=function(foo,users){
	foo.addImportPath(__dirname+'/viewmacros');

	passport.serializeUser(function(user,done){
		done(null,user.id);
	});

	passport.deserializeUser(function(id,done){
		done(null,users[id]);
	});

	passport.use(new LocalStrategy(function(username,password,done){
		for(var userId in users){
			var user=users[userId];
			if((user.name===username)&&(user.pass===password)){
				done(null,user);
				return;
			}
		}
		done(null,false,{message:'Could not log you in'});
	}));

	function ensureAuthenticated(req,res,next) {
		if(req.isAuthenticated()){ return next();};
		res.redirect('/admin/login');
	}
	return ensureAuthenticated;
}


IPAdmin.prototype.configureExpress=function(express,app,bodyParserOptions){
	if(bodyParserOptions===undefined)bodyParserOptions={};
    app.use(bodyParser.json(bodyParserOptions));                        
	bodyParserOptions.extended=true;
    app.use(bodyParser.urlencoded(bodyParserOptions));
	app.use(cookieParser());
	app.use(session({secret:'keyboard cat',resave:true,saveUninitialized:true}));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(flash());
}

IPAdmin.prototype.setupRoutes=function(app){
	app.get('/admin/login',function(req,res){
        res.render('login', {messages:req.flash('error')});
	});

	app.post('/admin/login',passport.authenticate('local',{failureRedirect:'/admin/login',failureFlash:true}),function(req, res) {
        res.redirect('/admin');
	});

	app.get('/admin/logout',function(req,res){
        req.logout();
        res.redirect('/admin/login');
	});
}
