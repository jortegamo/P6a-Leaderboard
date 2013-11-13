// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players"); 
// se ejecuta tanto en el servidor como en el cliente. Esta base de datos no tiene tablas.
// En el servidor hace que se cree esta base de datos, además se apunta
// todos los navegadores que están usando esta aplicación. 
// En el cliente hace posibles las consultas de las entradas. 


if (Meteor.isClient) { // helpers del templates. 
  // si ha habido cambios los actualiza por que son reactivos. //se programa declarativamente.
  //para ordenar según el nombre: sort: {name: 1} Importante !!!!!
  Template.leaderboard.players = function () {
  	if (Session.get("sort_by_score")){	 // si la base de datos ha cambiado => se vuelve a evaluar. 
    	return Players.find({}, {sort: {score: -1}});
    }else{
    	return Players.find({}, {sort: {name: 1}});
    }
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.leaderboard.events({
    'click input.inc': function () {
      Players.update(Session.get("selected_player"), {$inc: {score: 5}});
      },
     'click input.del': function (){
      Players.remove(Session.get("selected_player"));
     },
     'click input.change_sort': function(){
      if (Session.get("sort_by_score")){
      	Session.set("sort_by_score",false);
      }else{
      	Session.set("sort_by_score",true);
      }
     },
     'click input.add': function(){
     	var name = $('#msg');
     	if (name.val() != ''){
     		var score = Math.floor(Random.fraction()*10)*5;
     		Players.insert ({name: name.val(), score: score});
     		name.val('');
     	}
     },
     'click input.reset': function(){
     	var newscore = Math.floor(Random.fraction()*10)*5;
     	var players = Players.find({},{$sort: {score: -1}});
     	players.forEach(function(player){
     		Players.update ({ name: player.name } , {$set: { score: newscore } });
     	});
     }
  });

  Template.player.events({
    'click': function () {
      Session.set("selected_player", this._id); // ha cambiado la sesion por lo tanto todos los 
      // helpers que dependan de este campo se actualizan. 
    }
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      var names = ["Ada Lovelace",
                   "Grace Hopper",
                   "Marie Curie",
                   "Carl Friedrich Gauss",
                   "Nikola Tesla",
                   "Claude Shannon"];
      for (var i = 0; i < names.length; i++)
        Players.insert({name: names[i], score: Math.floor(Random.fraction()*10)*5});
    }
  });
}
