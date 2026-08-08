//knot.twist1=storyline.twist(subject,{twist}) returns proxied subject.
//knot.twist1.prop=7  creates a proxied property see on change libary.

knot.twists={}
knot.twists.prop1.twist1=plotpoint

knot.twist(twistid).involve(propid).incite(plotpoint)

$.thing.inventory.twist(plot.episodes.moth_makes_hole_in_bag).involve("contains").incite(plot.episodes.moth_makes_hole_in_bag)
$.thing.moth.twist(plot.episodes.moth_makes_hole_in_bag).enmesh("hunger").incite(plot.episodes.moth_makes_hole_in_bag)

plot.episodes.moth_makes_hole_in_bag
	.twist({knot:inventory,as:"inventory").enmesh("contains")
	.twist({knot:moth,as:"critter"}).enmesh("hunger")

****
Twists are a ply property?

*****

lexicon definition property select provides a function that when called will retrieve the knots.

select: ()=>$.person.knots
select: ()=>$.place.kitchen
select: ()=>$.place.filter((knot)=>knot.floor==="2nd")

****

Which of my friends should I ask to convince charlotte of something?

$.actor.player.friend.friend
	.filter(ply=>ply.knot===$.actor.charlotte)
	.sort(a,b=>a.ply.weight > b.ply.weight)
	.first().from.knot

******
knots contains the data that represents a vertex on a graph.

plies are the edges of a directed, weighted graph.  Each ply points a knot. A property not found in a ply will be forwarded to the knot because plies are proxied.

Cords are always a bundle of plies implemented as a set of key/value pairs, aka an object.  The keys are the ids of the plies which may or may not be identical to the ids of the knots they point to.

Tangles are bundles of either plies or knots, but not mixed, and set operations may be perfomed on them.

Cords allow plies to be referenced by ID.  Tangles do not.
Cords have a magic has property, aka wears(), carries().

Users may attempt to treat plies, knots, or tangles interchangeably.  They should be allowed to do so, where appropriate.  More importantly, they shouldn't be too concerned whether that are dealing in the singular (ply, knot) or the plural (cord, tangle).

If you restrict tangles to knots, you lose the context that the ply provides.

How does one implicitly convert up and down between singular and plural and remember which you are dealing with.

ply, knot, tangle, cord each need  knots and plies functions that convert to a tangle of knots or plies.

****
close all north doors in rooms

var allNorthDoors=$.place.explore(p=>p.is.room)  //$.place is cord p is ply.
	.exit.explore(e=>e.north.is.door)

allNorthDoors is a set of entwined plies?
AllNorthDoors is a set of plies
AllNorthDoors is a filtered deep copy of cord?

$.place.bar.exit.east  //points to library
$.place.foyer.exit.east //points to libery
$.place.library.exit.northwest  //points to bar
$.place.library.exit.southwest  //points to foyer




var allNorthDoors=$
	.place.explore(p=>p.is.room)  //$.place is cord p is ply.
	.exit.explore(e=>e.north.is.door && e.north.is.open)
	.forEach(e=>e.north
	.untie()  //removes ply and 
	.tie(...cordage.closed)).from($) //tying reflexive knots from the reverse perspective.

var allEastAndNorthDoors=$
	.place.explore(p=>p.is.room)
	.exit.(e=>e.east.is.door && e.east.is.open)
	.union (allNorthDoors)//implicit conversion to tangle
	.forEach(door=>{door.is.open.untie();door.tie(...cordage.closed).from($)})


Fix converse for reflexive ties. (done!)
Add fore and aft, which advance and retreat to the end of an entwined ply.  (done!)
Add _from() for .tie(), reverse persepective of _to(). done!


Path filters:

var cup =$.thing.cup.where(cup=>cup.on.saucer.where(saucer=>saucer.on("table"))&& !cup.contains("ring")) 

//working should also add to tangles?


var cup=$.thing.cup.on("saucer")


$.green.where(green=>green.is.edible).tangle.add() //returns cord of edible green things.

***************************************************
//knot.cord.ply
$.thing.cloak // returns cloak as ply done.

//knot.cord.ply.cord
$.thing.cloak.worn_by //returns cloak's worn_by cord  done.

//knot.cord.cord.ply.cord.ply
$.thing.is.wearable.is.touchable  //returns cord of all wearable, touchable thing plies.

//knot.cord()

$.thing.cloak.wornby($.actor.player) //returns cord of things warn by player.

//knot.cord.cord()
$.thing.worn_by($.actor) //returns cord of things worn by actors

$.thing.cloak.worn_by($.actor.player).ply or .knot //returns returns first ply or knot of cord

$.thing.is.wearable.is.touchable

$.thing.is("wearable", "touchable")

$.thing.wornby($.actor.in($.room.foyer)).untie().tie(...cords.in).to($.room.foyer)



*********************
plotpoints

Basic plot point:

story.pp1._`narration`.unfold(()=>true)

retraction plot point:  Used to check for error conditions.  Runs before parent plot point.  Causes parent plot point not to unfold if unfolding returns true.  Retractions stop processing after the first retraction returning true.  Plot point may be anonymous or named.

story.pp1.retract.pp._`no go`.unfold=function(twist){return true}

Preface plot points: Prefaces parent plot point narration text if unfold returns true. All prefaces are processed regardless of unfolding return status. Plot points may be anonymous or named

story.pp1.preface.pp._`narration`.unfold=function(twist){return true}
regardless of unfolding return status. Plot points may be anonymous or named

story.pp1.preface.pp._`narration`.unfold=function(twist){return true}

Revision plot points: replaces parent plot point if unfolding returns true. Does not prevent choice and child plot.

story.pp1.revise._`revised narration`.unfold(alternative unfold code ()=>true)

Choice:
Any plot point not preceded by retract, preface, revise is run after the parent plot point. 
If it has link, dropbox, message or input defined, the summary narration is appended to the parent narration and the  if child unfolding returns  true


plot.pp1.pick(()=>return all of them)  //of the list selected by 

plotpoint.pp1._`narration`.link`summary`
plotpoint.pp1.pp._`narration`.dropbox`summary`  //makes link droppable
plotpoint.pp1.pp._`narration`.message`summary` //makes link draggable
plotpoint.pp1.pp.plot`narration`.input`prompt`

plot.pp1.pp.choose(()->true)  //Selection criteria for choice plot points.  Defaults to all non-specialized child plot points.

********************
ishml.$.lexicon is an instance of ishml.Lexicon. 

ishml.$.lexicon.register("able").as({cord:"able"})
ishml.$.lexicon.register("exits to").as({cord:"exits_to",converse:"exits_to",semantics:(k1,k2)->$.reify`${k1} is place. ${k2} is place.`})
ishml.$.lexicon.register("exits east to").as({cord:"exits_to",converse:"exits_to", ply:"east", converse_ply:"west"})
ishml.$.lexicon.register("exits west to").as({cord:"exits_to",converse:"exits_to", ply:"west", converse_ply:"east"})
ishml.$.lexicon.register("exits north to").as({cord:"exits_to",converse:"exits_to", ply:"north", converse_ply:"south"})
ishml.$.lexicon.register("exits south to").as({cord:"exits_to",converse:"exits_to", ply:"south", converse_ply:"north"})
ishml.$.lexicon.register("exits in to").as({cord:"exits_to",converse:"exits_to", ply:"in", converse_ply:"out"})
ishml.$.lexicon.register("exits out to").as({cord:"exits_to",converse:"exits_to", ply:"out", converse_ply:"in"})
ishml.$.lexicon.register("exits up to").as({cord:"exits_to",converse:"exits_to", ply:"up", converse_ply:"down"})
ishml.$.lexicon.register("exits down to").as({cord:"exits_to",converse:"exits_to", ply:"down", converse_ply:"down"})
ishml.$.lexicon.register("contains").as({cord:"contains",converse:"contained_by"})
ishml.$.lexicon.register("contained by").as({cord:"contained_by",converse:"contains"})
ishml.$.lexicon.register("inside of").as({cord:"contained_by",converse:"contains"})
ishml.$.lexicon.register("surrounds").as({cord:"contains",converse:"contained_by"})
ishml.$.lexicon.register("carries", "carry").as({cord:"carries",converse:"carried_by"})
ishml.$.lexicon.register("describes","describe").as({cord:"describes",converse:"described_as"}) //for adjectives
ishml.$.lexicon.register("described as").as({cord:"described_as",converse:"describes"})
ishml.$.lexicon.register("wears", "wear").as({cord:"wears",converse:"worn_by"})
ishml.$.lexicon.register("is worn by", "are worn by").as({cord:"wears",converse:"worn_by"})
ishml.$.lexicon.register("is instance of","is kind of").as({cord:"instance_of",converse:"instantiates",semantics:()=>{}})
ishml.$.lexicon.register("instantiates").as({cord:"instantiates",converse:"instance_of",semantics:()=>{}})

ishml.$.lexicon.register("lighting is").as({cord:"lighting",converse:"lighting_of"})
ishml.$.lexicon.register("is lighting of ").as({cord:"lighting",converse:"lighting_of"})

$.reify`To wear is an instance of action. To be worn is an instance of action. player is able to wear.  A shirt is able to be worn.`

$.reify`Action classes to wear. Action is a classification of to be worn. player is able to wear.  A shirt is able to be worn.`
$.reify`green describes jade cup. small describes jade cup. The description of the jade cup is "tiny jade drinking vessel".`

ishml.reify`` ties and unties knots.

IDs must conform to the same standards as JavaScript variables.  Uppercase letters will be converted to lowercase.

reify DSL patterns


Articles are optional and ignored.

$=ishml.net  //net is an instance of Net. reify is a method of Net. The own properties of $ are all the knots created with reify.


[article] [knot1] [cord match text] (article)[knot2]. //connects two knots with tie named same as knot
[article] [knot1](ply) [cord] [article] [knot2]([ply]).  // connect two knots with named tie.
[article][knot1] no longer [cord] [knot2].  //removes tie between 1 and 2 and converse tie if strong.
[article] [knot_id1] is instance of knot_id2.  //In addition to creating tie also applies properties from 2 to 1.
[article] [knot_id1] and [knot_id2] are instances of knot_id3.  //In addition to creating tie also applies properties from 2 to 1.
[article] [knot_id1] is prototype of  knot_id2.  //In addition to creating tie also applies properties from 1 to 2.

if a double quote is needed in description, use html entities.


story.reify`A container is a kind of thing. A person is a kind_of actor.  A place is a kind of location.`
story.reify`The bar is an instance of place. "a dank and dirty dive", the bar (south), exits to "a sparkling place", the foyer (north). The foyer is kind of place.`  //strong converse
story.reify`The bar is a kind instance of place. The bar (east) exits to foyer (north). The foyer is kind of place.`  //strong converse
story.reify`The bar is a kind instance of place. The bar (nowhere) exits to foyer (north). The foyer is kind of place.`  //no converse tie

story.reify`The bar is a kind of place. The bar exits north to foyer. The foyer is kind of place.`  //strong converse tie

story.reify`bJewelry is an instance of thing. Jewelry is able to be carried. Jewelry is able to be worn.  Jewelry is described as valuable.`
story.reify`The player wears a ring, which is_worn_by player. The player is_kind_of person.  The ring is_kind_of jewelry.` //weak converse instead of strong converse.
story.reify`The player wears a ring. The player is a kind of person.  The ring is kind of jewelry.` //strong converse on wears 
story.reify`The player is able to drink from. A cup is able to be drunk from.`
story.reify`A cup is a kind of thing.`
story.reify`The blue cup is a kind of cup.  The blue cup is in the foyer.`
story.reify`The Green cup is a thing. The cup is described as green.  A green cup is in the cupboard, which contains the green_cup. The cupboard is in the bar.`
story.reify`The cup is an instances of container and supporter.`

Has creates properties.  Is assigns them.

who may also be used instead of that
$.reify`the bar description is "a dank and dirty den". The bar has lighting of dim. The bar lighting is dim.`  //make an enum for lighting and add dim.
$.reify`the bar description is "a dank and dirty den". The bar has lighting. The bar lighting is true.` //set to boolean
$.reify`the bar description is "a dank and dirty den". The bar has lighting. The bar lighting is 5.` //set to number
$.reify`player who wears cloak no longer wears cloak; the cloak is in the foyer.`
$.reify`the bar description is "a dank and dirty den". The bar has lighting, which is dim.`

\\$.check method returns $ if true and null if false, allowing conditional chaining

if ($.check`player wears cloak and player wears ring`)
{
	$.reify`player no longer wears cloak. Now the cloak is in the foyer.`
}

$.check`player wears cloak and player wears ring`?.reify`player no longer wears cloak. Now the cloak is in the foyer.`

// A thread is an array of plies.

$.path_from`foyer to bar via exits to or other cord or other cord.`
$.follow`foyer to bar via exits to or other cord or other cord using depth.`
$.find_thread_from`foyer to bar via exits to or other cord or other cord using breadth.`
$.find_thread_from`foyer to bar via exits to or other cord or other cord using A*.`

May be better to use existing syntax for threads?



$.query`Who wears a ring or who carries a bottle and a calling card?`
$.query`who wears a ring which is shiny?` //returns play
$.query`who wears a ring that is shiny?`  // returns player
$.query`what is shiny and worn by player?`  //returns ring
$.query`who wear a ring and carries token and a calling card.`
$.query`who does not wear a ring.` //does not wear matches negative cord.  negation=true
$.query`what place contains player and where lighting is dim?'
$.query`which place where lighting is dim contains player?'
$.find`a knot that is described as green and that is carried_by {$.person.player} who carries {$.thing.ring} which is described as stolen.`

$.check`player wears or carries a ring.`  //initial that is a noise word.
$.check`ring is worn_by anyone.` anyone macro for any, who are instance of person.
$.check`player has any`
$.check`all, who are instance of person, have a ring.` 
$.check`any person who has a ring.`  //everyone is a macro for "all, who are instance of person,"
$.check`any thing able to be worn ring.`

********************************************************
 https://en.wikipedia.org/wiki/Semantic_network
The story world, an instance of ishml.Net, is a semantic network. It is a searchable knowledge base for facts about the story.  

$=new ishml.Net()  //The $ symbol stands for story_world, but is much shorter to type.

Facts take the form of [term1,role1,predicate,term2,role2].

An example is "Player wears ring."  Player is the subject, ring, the object. The two are joined through the predicate wears.  

Subject, objects, predicates, and facts are entities stored in the knowledge base by their ids.  The id of a triple is the ids of the subject,predicate,term concatenated together: player_wears_ring.

Facts are store in the net as semantic triples:
ishml.Fact is the class for creating Facts.

$.add'player_wears_ring`.fact(term1, predicate class, term2)
$.add`ring_worn_by_player`.fact(term1, predicate class, term2)  //DEFECT NO.  No object first predicates

add.fact adds fact, terms, and predicate and fact to database. add.fact instantiates predicate from its class and predicate's constructor may add additional facts to the semantic network.


$.add'player_wears_ring`.fact(term1, predicate class, term2) adds the following to the knowledge base if they don't already exist

//creates the following entities to the knowledge base.

$.player=term1  
$.ring=term2
$.wears=instance of predicate class
$.player_wears_ring={term1, $.wears, term2}  //instance of fact.

player, ring, and wears are present so that they can be retrieved for future reify statements involving different terms and/or different predicates or just for convenient use.

//Indexing 

The indices are term1, term2, predicate, and term1_term2.
They are used to retrieve lists of facts. 

Or do they just retrieve the missing item so that indexes can function as a repository for a term's properties?

term1 answers queries in the form of `player wears ____` and `player ____ ____` 
term2 answers queries in the form of `____ wears ring` and `____ ____ ring` 
predicate answers queries in the form of `____ wears ____`
term1_term2 answers queries in the form of `player ____ ring`

The `___ ___ ___` query is answerable by any of the indexes, but will probably use predicate index for this.

$.add'player_wears_ring`.fact(term1, predicate class, term2) 

//creates the following entries the indexes 


$.predicate.wears=array of facts //___ wears ___

$.term1.player.wears.ring=fact  spo
$.term1.player.wears=associative array of facts //player wears ___

$.term2.ring.wears.player=fact ops
$.term2.ring.wears=associative array of facts ops //___ wears ring 

$.term1_term2.player.ring.wears=fact sop
$.term1_term2.player.ring= associative array of facts  // player ___ ring

$.check`player wears ring` returns true if array length >0
$.check`${term1} wears ${term2}` returns true if array length >0
$.check`___ wears ring` returns true if array length >0
$.check`player wears ___` returns true if array length >0
$.check`___ wears ___` returns true if array length >0

$.select`player wears ring` returns array of facts
$.select`___ wears ring` returns array of facts
$.select`player wears ___` returns array of facts
$.select`___ wears ___` returns array of facts


Maybe go this way:
$.term1.player.wears.facts //returns a list of Facts
$.term1.player.wears.fact //returns the first fact fitting the criteria
$.term1.player.wears.ring //returns ring

Should term properties also be retrievable? Are Term property names (attributes) just predicates?  That would make the values term2, but should values indexed? How?
$.term1.player.strength.value  //return 10, the value of the player.strength property, using the strength 

$.select`___ is person`.where((term1)=>term1.strength > 5).term1  //predicate, term2
$.select`___ is person`.where((term1)=>term1.strength > 5).first_fact //last_fact, pick_fact
$.select`___ is person`.where((term1)=>term1.strength > 5)  //returns list of facts.

$.select`_friend_ is person that owns pet and that lives_in apartment or that owns bicycle`

That is a stand-in for term1 of first clause.  

Selects  1: "___ is person" facts.
Selects  2: "___ owns pet" facts where term1 from first clause matches.
Selects  3: "___ lives_in apartment" facts where term1 from first clause matches.
Selects  4: "___ owns bicycle" facts where term1 from first clause matches.

1 intersection ((2 intersection 3) union 4

Any id that is not in the network is a placeholder for missing information..  

$.select`___ is person` //equivalent to below.
$.select`who is person` //equivalent to above


placeholders may be used elsewhere in the query without the underscore to create restrictive clauses that subset the prior clause.

$.select`_who_ is person who that owns pet who that lives_in apartment.

"that" indicates a restrictive clause on the prior clause correlated on term1. "which" indicates a restriction of the prior clause on term2. 

facts=$.select`who is person that lives_in apartment that owns something which is pet that runs free that answers_to fido that lost collar.`
facts.reify`fact is irresponsible_pet_owner`

$.select`___ is person that lives_in apartment that owns _something_ which is pet that runs free that answers_to fido that lost collar.`.reify`_who_ is irresponsible_pet_owner`

$.select`___ is person that lives_in apartment that owns _something_ which is pet that runs free that answers_to fido that lost collar.`.facts  //array of triples ___ is person fitting the restrictions

$.select`___ is person that lives_in apartment that owns ___ which is pet that runs free that answers_to fido that lost collar.`.reify`___ is irresponsible_pet_owner`

$.select`_who_ is person that lives_in apartment that owns _something_ which is pet that runs free that answers_to fido that lost collar.`.reify`term1 neglects _something_`.reify`_something_ is_neglected_by term1`

ishml.Predicate is a class for creating predicates.  Constructor takes term1, term2, role1, role2

ishml.Predicate.select=(term1,term2)=>$.select`$term1 {this.id} term2`

ishml.Predicate.select=(term1,term2)=>this.$.select`${term1.id} is person that lives_in apartment that owns ${term2} which is pet that runs free that answers_to fido that lost collar.`.map((fact)=>fact.predicate=this)

ishml.Predicate.check=(term1,term2)=>this.select(term1,term2).length>0



And and or may link terms and/or predicates, but not clauses.  

$.select`john or betty

; may be used for union joins.



The first clause, `_who is person` is the subject of the query. The additional clauses are restrictive.

$.select`player owns _that which is lost and broken and which left home.`

Use not before a predicate to negate:

$.select`_who is person who owns pet who not lives_in apartment.`

And/or may be used to connect terms or predicts.  

$.select`_who is person who owns pet who lives_in apartment or owns bicycle`


predicate which is the property predicate.
$.term2.value.is_strength_of.player
$.check.`10 is_strength_of player`
$.check.`"Mr. Mittens" is_name_of pet`
$.player.strength //returns 10



only one query per check or select. no multiple statements.
relative clauses and boolean logic may be used to refine search

//Term roles:

Term roles, instances of String,  are in brackets after the term and are passed to the predicate constructor as part of the fact generation process.  Predicate constructor (term1,role1,term2,role2)  does the actual job of adding facts???

roles are alternative names for terms in the term2 role, never term1.  

$.reify`bar [north] connects foyer [south].` //two-way connection
$.reify`bar connects foyer [south].`  //one-way connection because that's how connects constructor works.

The north in bar [north] refers to inverse relation only.

term1, term2, predicate, and term1_term2
$.term1.bar.connects.foyer=$.foyer
$.term1.bar.connects.south=$.foyer
$.term2.foyer.connects.bar=$.bar
$.term2.foyer.connects.south=$.bar



Inverse predicates:  NO ONLY STORE THE FORWARD DIRECTION.

`John wears ring` implies `ring is worn by john` and vice versa.  The two predicates are inverses of each other. In both facts the same pair of terms are use and the two predicates are inverses of each other. 

The inverse relation is stored a fact in the knowledge base using the reciprocates predicate:

$.reify`${predicate1} reciprocates ${predicate2}`
$.reify`$wears reciprocates worn_by.`


Compound facts:

The statement `John gave ring to jane` generates two fact:

{john,gave,ring} and {john_gave_ring,to,jane}


Reify DSL:
Statements describe facts and  decompose as follows:
statements=>statement+
statement=>term [term_role] (predicate term [term_role])+.
term=>ishml.term | ishml.fact



If subject or target does not yet exist, create it using template literal notation.

reify`${{id:"bar",description:"a dank and dusty den",name:"Dimby's Bar"}} [south] exits_to ${{id:"foyer",description:"brightly lit"}} [north]`


After it exists it may be referred to by its id.  Spaces ok for ids, but converted to underscores.  If name or description missing ID with underscores converted to space is used.

Predicates are defined is 

Adding Predicates
Predicates may be symmetric, invertible, and or transitive.
ishml.$.lexicon.register("exits north to").as(class exits_north_to extends ishml.Predicate{
	constructor(subject,target)
	{

	}
	check(subject,target) 
	{
		return true //or false
	}

})

$.reify is an alternative to $.add().fact().  It uses a DSL to reduce cognitive load.

ishml.reify`${{id:"bar",description:"a dank and dusty den",name:"Dimby's Bar"}} (north) exits_to ${{id:"foyer",description:"a cheerful and welcoming place"}} (south)`
ishml.reify`${{id:"locket",description:"a beautiful locket"}} is thing. Bar contains locket.`
ishml.select`__ contains locket.`  //Returns all facts where term1 contains locket.
ishml.check`bar contains locket` //Return true if at least one fact matches the pattern.














predicates should contain history information?

John likes mary. John kissed mary. Now mary likes john.
John kissed mary because john likes mary.  Mary likes john because john kissed mary.

When did john kiss mary?  Does "Now" indicate a consequence of John's action?  What does this graph look like.

john-likes-mary. john-kissed-mary. mary-likes-john.

(john-kissed-mary)-because-(john-likes-mary).  (Mary-likes-john)-because-(john-kissed-mary).

player=wears=ring.  //implies converse: player-wears-ring. ring-worn by-player.

reify`mary likes john because john likes mary.`
(bar-exits-north)-to-foyer.



Reifying:


plot points:

Consider an event bubbling system like webpages use.
Consider that plot points form a graph and therefore might be represented in a triple store?

registers event listeners on story element by using proxies to trigger plot points on element properties.


Tried is a keyword in the when criteria.

plot.action.going.when`___ tried going`.resolve(()=>)
plot.action.going.before.when`player in foyer and player tried going north and not player wears cloak .`.resolve(()=>say`It's going to be chilly.`)
plot.action.going.after.when`player in foyer and player tried going north and not player wears cloak .`.resolve(()=>say`You feel a cold wind rush toward you as you exit the door.`)

plot.action.going.instead.when`player in foyer and player tried going north and not player wears cloak .`.resolve(()=>say`The rush of cold wind from the open door makes you think better of it.`)

plot.action.going.narrate()

do we need another network for history?  Or can it be in the main repository.  Use when to vs if 
fact,turn_started, turn_ended, tick_started, tick_ended
Do facts needs a payload?  For example to store command data

//small semantic network added to event and event sent to plot chain.
//now does a reify to the story_world.  Before or after running it through the plot?

ishml.now`player tried going.`.event({supplemental data now:network}) 

//The plot is an array of event handlers.  the `facts` are match against the list 

ishml.plot.match`___ tried going`.do((event)=>{})
ishml.plot.match`sally tried going`do((event)=>
{
	this.bubble(event)
	blah blah...
})  //before
ishml.plot.match`sally tried going`.do((event)=>{
	blah blah...
	this.bubble(event)
})  //after
ishml.plot.match`sally tried going`.do((event)=>{})  //instead

ishml.plot.match`___ tried going`.do((facts)=>
{
	facts.forEach((fact)=>
	{
		$.now.`${fact.term1} in ${fact.term2}`.event()
	})
})

ishml.story={}  //holds pages for choice based
ishml.passage.dinner._`some html to display ${this.choices(()=>selection rules).link}` //choices returns array of pages.
	.link`display text for link to this page. if anchor tag not present, wrap.`
	//registers display of the page: ishml.plot`player went to dinner`.do(display page)
	.plot`player went_to dinner` 
	.event(my_event_data) //event to associate with plot. May be event data or function that returns event data
	.append(`document selector for page destination`) //.replace .prepend

ishml.passage.dinner.soup  //creates choice under dinner
ishml.passage.soup  //creates soup under passages
ishml.passage.dinner.soup=ishml.passage.soup  //reuses passage.soup as a choice under dinner.
plotpoint.pp1._`narration`.link`summary`
plotpoint.pp1.pp._`narration`.dropbox`summary`  //makes link droppable
plotpoint.pp1.pp._`narration`.message`summary` //makes link draggable
plotpoint.pp1.pp.plot`narration`.input`prompt`

ishml.story={}  //holds pages for choice based
ishml.passage("dinner")._`some html content
						<a onClick="ishml.story.soup.narrate()">soup</a>` //choices returns array of pages.
	//registers display of the page: ishml.plot`player went to dinner`.do(display page)
	.plot`player went_to dinner` 
	.event(my_event_data) //event to associate with plot. May be event data or function that returns event data
	.append(`document selector for page destination`) //.replace .prepend

Instead of implementing passages/plotpoints above just use phrases!  
Anchor tags in the phrases embed the events and trigger plot when clicked.
Can phrases just be stored in plot?  Can the network store passage?

passages are just {id,description} where the description is a phrase.  Technically, they are terms.  $.passage is just syntactic sugar.

$.passage("dinner")._`this is the dinner phrase`
Creates the term dinner without any corresponding fact about it. And creates corresponding match in plot.

ishml.plot.match`dinner`.do((event)=>$.dinner.say(event))
ishml.plot.match`soup`.do((event)=>soup_phrase.say(event))
ishml.plot.match`salad`.do((event)=>soup_phrase.say(event))


ishml.plot.situation`___ tried going`.do((event)=>{})
ishml.plot.situation`sally tried going`do((event)=>
{
	this.bubble(event)
	blah blah...
})  //before
ishml.plot.situation`sally tried going`.do((event)=>{
	blah blah...
	this.bubble(event)
})  //after
ishml.plot.situation`sally tried going`.do((event)=>{})  //instead

ishml.plot.situation`___ tried going`.do((facts)=>
{
	facts.forEach((fact)=>
	{
		$.now.`${fact.term1} in ${fact.term2}`.event()
	})
})

ishml.plot
	.situation`player tried ordering_dinner`
	._`Would you like <a href="soup" class="scene" event="player tried ordering_soup">soup</a> or <a href="salad" class="scene">salad/<a>.`
ishml.plot
	.situation`player tried ordering_soup`
	._`Very good, one soup.`
	.do((event)=>{$.reify`now player ordered soup.`})



ishml.plotline`_room1_ exits _direction_ to _room2_`.implies`ROOM1 is place. ROOM2 is place. ROOM2 exits ${oppositeDirection[DIRECTION]} to ROOM1.`
ishml.plotline`_room1_ exitsOneWay _direction_ to _room2_`.implies`ROOM1 is place. ROOM2 is place.`

reifying:

parse statements into predicate, terms, adjectives.
Add new #term#s.
Filter terms from statements by their adjectives.
Pass statement to predicate for reification because each predicate has its own rules for reifying.


ishml.reify=function(literals, ...expressions)
{

    //parse statements into predicate, terms, adjectives.
    // Add new #term#s.
    // assign actual terms to arguments
    //Filter terms from statements by their adjectives.
    //Pass statement to predicate for reification because each predicate has its own rules for reifying.
	var source=ishml.toString(literals, ...expressions)
	
	let {success,interpretations}=ishml.dslParser.analyze(source)
	if (success)
	{
		
		if (interpretations.length==0)
		{
			throw new Error("ERROR 0006: Unable to parse reify source code-- no interpretations.")
		} 
		else if (interpretations.length>1) 
		{
			throw new Error("ERROR 0007: Unable to parse reify source code-- more than one interpretation.")
		}
		else
		{
			interpretations[0].gist.forEach(statement=>
			{
				statement.placeholder={}
                statement.arguments.forEach((argument,index)=>
                    {if (argument.value.term.startsWith("#")) argument.value.term=argument.value.term.slice(1,-1)})
		/*		statement.arguments.forEach((argument,index)=>
				{
					let termId=argument.value.term
					if (termId.startsWith("#") ) //add ad-hoc terms to semantic network.
					{
						termId=termId.slice(1,-1)						
                        argument.value.term=new ishml.term(termId)
					} 
                    else argument.value.term=this.net[termId]

				})*/
                console.log(statement)
				//predicate determines how statement translates into facts include how adjectives are handled
                // player carries ring vs. ring is shiny.
				statement.predicate.reify(statement)  
			})
		}
	}
	else
	{
		console.log(interpretations)
		throw new Error("ERROR 0005: Unable to parse reify source code.")

	}

}



//reify.dsl.statementTermClause=reify.Rule()

/*reify.dsl.statementTermClause.configure({mode:reify.Rule.apt})
    .snip(0) //fact
    .snip(1,reify.dsl.term)
reify.dsl.statementTermClause[0] //fact
    .snip("leftBracket").snip("subject",reify.dsl.statementTermClause).snip("gerund").snip("directObject",reify.dsl.statementTermClause).snip("prepositionalPhrases",reify.dsl.statementPredicate.prepositionalPhrases).snip("rightBracket")
    .configure({semantics:interpretation=> //Due to wildcards, each statement may involve multiple facts.  
    {
        let gist =interpretation.gist
        let directObject=gist.predicate.directObject
        let gerund=gist.gerund.definition
        let predicate=gerund.predicate
        let prepositions=gist.prepositionalPhrases.map(preposition=>preposition.definition.key)
        let argumentList=[]
        //Check if prepositions match
        if (prepositions.length !== predicate.prepositions.length) return false
        prepositions.forEach((preposition,index)=>{if(preposition!==predicate.prepositions[index]) return false})
        
        argumentList.push(reify.net[gist.subject.definition.key])
        if(directObject) argumentList.push(reify.net[directObject.definition.key])
        predicate.prepositionalPhrases?.forEach(phrase=>argumentList.push(reify.net[phrase.target.definition.key]))
    
        let id=argumentList[0].id +" "+reify.lang.ing(predicate.id)
        for (let index = 1; index < argumentList.length; index++) {id=id+" "+argumentList[index].id}
        id="["+id+"]"
        interpretation.gist={id:id,predicate:predicate,tense:verb.tense,mood:verb.mood,voice:verb.voice,polarity:verb.polarity,terms:argumentList}
        return true

    }})

reify.dsl.statementTermClause[0].gerund.configure({filter:(definition)=>definition?.part==="gerund"})
reify.dsl.statementTermClause[0].leftBracket.configure({regex:/^\[/,lax:true})
reify.dsl.statementTermClause[0].rightBracket.configure({regex:/^\]/,lax:true})*/

Placeholders
placeholder.npc={index:0,term:true}
placeholder.thing={index:1,term:true}
placeholder.action={predicate:true}

Calculating specificity:

select`player carries ring. player carries amulet.` 4 terms, 2 facts: specificity=[2]
select`player carries shiny or green ring. weary player carries amulet.` 4 terms, 3 adjectives, 2 facts: specificity=[2,3/2]=[2,1.5]

but shiny and green is more specific than shiny or green

green is more specific than not green.

Specificity for logic blocks x and y is 2 times more specific than x.  x or y is .5 specific of x. 
 x and y and z is 4 times less specific than 

Each specifically name term has a specificity of 2
Adjectives have specificity of 2
 Multiply specificity for each AND operation performed on adjectives.  
 Divide specificity for each OR operation
 x and y or z= (2*2)/2=2
x or y =1

 

 factSpecificity = adjectiveSpecificity * termSpecificity

 nah, just do it the way css does term count and tie goes to adjective count.

 
 Scene processing uses the rete algorithm.  
 reify.plot holds the rules in a network structure
 The first level contains terms and adjectives.
 plot.player={_value:true,  carries:{ring:{},canteen:{}},
                            carried:{crowbar:{on_turn:[99],at_tick:[1500]}},
                            does not carry:{ring}



            }
 plot.ring
 plot.shiny={_value:true}
 plot.dull
 plot.surface
 plot.has
 plot.is
 plot.carries

When a fact is created, index converse and both polarity

 plot.player.carries.ring={value:ring,scenes=[]}
 plot.ring.carried_by.player={value:player,scenes=[]}
 plot.player



Story elements are the persons, places, things, concepts, and qualities that are used to build the story world.  Story elements are mostly terms, but adjectives can be story elements, too.

Story elements combine with predicates to create facts.  The set of all facts creates a reality representing the story world. Facts look similar to simple English sentences.  Each fact is composed of two or more story elements and a predicate and ends in a period. Consider the fact "player carries ring." Player and ring are story elements related by the predicate carry. 

Typically, a simple predicate connects two terms (the subject and direct Object) using a verb. When the predicate connects more than two elements, the predicate will also includes prepositions to connect additional terms (indirect objects).  Consider the fact "Jamal gave ring to Sarah." Here, Jamal, ring, and Sarah are story elements connected by the predicate give_to. Gave connects the subject, Jamal, to the direct object, ring, and "to" connects the giving of the ring to Sarah (the indirect object of the fact.)

In reify, a predicate's verb is defined as the characters between the first and second terms. In the fact "foyer is east of bar.", "is east of" in its entirety is considered the verb.  

A predicate may have multiple verb forms define for past and present tense. For example, "player carries ring" expressed in the past tense is "player carried ring." When a fact moves from present to past tense it indicate that the fact is no longer valid in the present, but did exist in the past.

A fact may be express with the positions of the direct object and subject swapped.  For example, "player carries ring" and "ring is carried by player" express the same fact. The passive form "is carried by" is the converse relation of the active form "carries." While many predicates use passive voice to express the converse relation, this is not always the case.  The converse of "foyer is east of bar" is "bar is west of foyer.", for example.

Facts exist in the context of time and turn.  To remove a fact from the present state of the story world, negate the fact: "player does not carry ring." Past tense may be used to check if the fact was active in the past: "player carried ring.", "player carried ring before_turn 10.", "player carried ring between_tick 20 through_tick 80."

Adjectives:

Predicates may link terms to adjectives. They are both story elements and receive the same treatment. When a term is linked to an adjective, a cupola is formed, for example,  "ring is magic." In Reify, cupola predicates have no converse. "magic is ring" may be poetic, but it is not allowed. The "is" predicate is good for connecting terms with adjectives, but sometimes we to describe a property associated with the term rather than the term itself. Let's consider an apple that has a red skin and white flesh. Having both facts, "apple is red." and "apple is white.", is contradictory and does not express what we need.  Instead we need to define separate predicates.  For example, "apple skin_is red." and "apple flesh_is white." 

Term property creation creates associated predicates by appending _is.  For example ring.surface creates surface_is

The plot is a POJO.  with some numeric keys indicating element role and predicate keys at the top level


plot[0] //subject index
plot[1] //direct object index
plot[2] //indirect object index, etc

plot[0].term0.a_predicate.present.term1.term2
plot[0].term0.a_predicate.past.term1.term2
plot[0].term0.a_predicate.present.affirmative.term1.term2
plot[0].term0.a_predicate.present.negative.term1.term2
plot[0].term0.a_predicate.past.affirmative.term1.term2
plot[0].term0.a_predicate.past.negative.term1.term2

plot[1].term1.a_predicate.present.term2
plot[1].term1.a_predicate.past.term2
plot[1].term1.a_predicate.present.term2
plot[1].term1.a_predicate.present.term2
plot[1].term1.a_predicate.past.term2
plot[1].term1.a_predicate.past.term2

plot[2].term2.a_predicate.present
plot[2].term2.a_predicate.present.affirmative
plot[2].term2.a_predicate.present.negative
plot[2].term2.a_predicate.past
plot[2].term2.a_predicate.past.affirmative
plot[2].term2.a_predicate.past.negative

plot.a_predicate.present
plot.a_predicate.present.affirmative
plot.a_predicate.present.negative
plot.a_predicate.past
plot.a_predicate.past.affirmative
plot.a_predicate.past.negative











Scenes:

scene`player carries ring.`
    plot.player.carry.ring.scenes.unshift(scene)

    plot[0].player.carries.ring.scenes.unshift()

scene`player carries _something_.`
    player.carry.scenes.unshift(scene)
    plot[0].player.carries

scene`_someone_ carries ring."
    carry[1].ring.scenes.unshift(scene)

scene`_someone_ carries _something_.`
    carry.scenes.unshift(scene)

scene`_someone_ gives _something_ to Sarah.`
    give_to[2].Sarah.scenes.unshift(scene)

scene`player gives _something_ to Sarah.`
    player.give[1].Sarah.scenes.unshift(scene)

scene`_someone_ _verb_ ring to Sarah.`


scene`player carries ring.`
    plot.player.carry.ring.scenes.unshift(scene)

scene`player carries _something_.`
    plot.player.carry.__
scene`_someone_ carries ring."
    plot.__.carry.ring


scene`_someone_ carries _something_.`
    plot.__.carry.__

scene`_someone_ gives _something_ to Sarah.`
    plot.__.give_to.__.sarah

scene`player gave_to _something_ to Sarah.`
    plot.__.gave_to.__.sarah

scene`_someone_ _verb_ ring to Sarah.`
plot.__.__.ring.Sarah



Terminology

Production memory (PM)  plot
Working memory  (WM)    world //currently net
WME                     fact
input                   reality //a set of facts is a reality

WME is tuple of:

    identifier          term0
    attribute           predicate
    value               term1

Rule
    Left Side LHS       scene
    right Side RHS      action
 
Token is a sequence of WMEs

The alpha network matches facts against patterns. Basically, it's a trie of select statements.   For example: pattern `_who_ carries ring` is condition1.  Condition1 contains 3 tests
The alpha network is populated with all the facts from the now() reality.  Once that's done activated alpha nodes can move on to the beta 


condition1=()=>true ---> (p)=>p===carry---> (directObject)=>directObject===ring



plot.__.__.__={reality:All binary facts, scenes:{scenes that are triggered when any fact with an arity of 2}}
plot.__.__.__.__={reality:All ternary facts, scenes:{scenes that are triggered when any fact with an arity of 3}}

scene`_who_ carries ring`.action(()=>()) //affirmative, present tense

plot.__.carry.ring={}

plot.player.carry.ring={}

scene`player carries _something_ and player is strong`
scene`player carries _something_ and player is weak`


plot.player.carry.__={} //p1
plot.player.is.strong={} //p2
plot.player.is.weak={} //p3

`p1 and p2`

and1=()=>p1 && p2
and2=()=>p1 && p3
p1.operations.add(and1)  //operations is a set
p2.operations.add(and1)
p1.operations.add(and2)
p3.operations.add(and2)

scene`player carries _something_`
where`#something weight_is heavy and #something value_is _value_`
title`player decides to keep`


scene`player is offered choice`
aka`player decides to keep`



Scene DSL:

condition => term termOperations*
termOperations=> orOperator term
term => factor factorOperations*
factorOperations=> andOperator factor
factor => operand
factor=>notOperator factor
factor=>leftParen condition rightParen
operand => trigger | pattern
trigger => when pattern
pattern => subject complement
subject => element | wildcard | placeholder
complement => verb verbComplement
verbComplement => directObject prepositionalPhrases*
prepositionalPhrases =>preposition target
directObject =>  element | wildcard | placeholder
target => element | wildcard | placeholder
placeholder=>/^#[a-zA-Z]\w*[a-zA-Z]/
wildcard=>/^_[a-zA-Z]\w*_/


pattern.semantics=(gist)=>
{
    //up to and including when is the alpha network. 

    
    const terms=gist.terms
    const subject=terms.shift()
    const predicate=fact.predicate.id

    if (subject.startsWith("_")) subject="__"

    plot[subject]??={}
    plot[subject][predicate]??={}
    let subplot=plot[subject][predicate]
    
    terms.forEach(term=>
    {
        subplot[term]??={}  //defect wild cards and placeholders
        subplot=subplot[term]
    })

    subplot[gist.tense]??={}
    subplot=subplot[gist.predicate.tense]
    subplot[gist.predicate.polarity]??={}
    subplot=subplot[gist.predicate.polarity]

    if (gist.when)
    {

        subplot[when]??={scenes:new Set(),reality:new Reality()}
        return subplot[when]
    }
    else
    {
        subplot.scenes=new Set()
        subplot.reality=new Reality()
        return subplot
    }
}




now`player carries ring`

reify.now=function(literals,...expressions)
{
    reality= facts 

    reality.forEach((fact)=>
    {
        const terms=fact.terms
        const subject=terms.shift()
        const predicate=fact.predicate.id
    


    })
}

a plotLine is an alpha node
//wildcard keys are wild card names. values are argument index
subplot.plotLine??={scenes:[],reality:new reify.Reality(),specificity:specificity,wildcard:wildcard} 

a scene is a implication: a condition paired with an action

scene={condition, storylines, action}

if(scenes[0].condition()) scenes[0].action(something)

dsl.term=ISHML.Rule()	
dsl.power=ISHML.Rule()
dsl.group=ISHML.Rule()
dsl.number=ISHML.Rule()

dsl.expression=ISHML.Rule()
		


        expression.snip("term",term).snip("operations")
        expression.operations.snip("operator").snip("operand",term)
            .configure({minimum:0, maximum:Infinity,greedy:true})
        expression.operations.operator.configure({filter:(definition)=>definition.part==="termOp"})
        
        term.snip("power",power).snip("operations")
        term.operations.snip("operator").snip("operand",power)
            .configure({minimum:0, maximum:Infinity, greedy:true})
        term.operations.operator.configure({filter:(definition)=>definition.part==="factorOp"})

        power.snip("group",group).snip("operations")
        power.operations.snip("operator").snip("operand",power)
            .configure({minimum:0, greedy:true})
        power.operations.operator.configure({filter:(definition)=>definition.part==="powerOp"})
        
        group.configure({mode:ISHML.enum.mode.apt})
            .snip(1)
            .snip(2,number)
        group[1].snip("begin").snip("expression",expression).snip("end")
        group[1].begin.configure({keep:false,filter:(definition)=>definition.part==="begin"})         
        group[1].end.configure({keep:false,filter:(definition)=>definition.part==="end"}) 




     expression.snip("term",term).snip("operations")
        expression.operations.snip("operator").snip("operand",term)
            .configure({minimum:0, maximum:Infinity,greedy:true})
        expression.operations.operator.configure({filter:(definition)=>definition.part==="termOp"})
        
        term.snip("power",power).snip("operations")
        term.operations.snip("operator").snip("operand",power)
            .configure({minimum:0, maximum:Infinity, greedy:true})
        term.operations.operator.configure({filter:(definition)=>definition.part==="factorOp"})

        power.snip("group",group).snip("operations")
        power.operations.snip("operator").snip("operand",power)
            .configure({minimum:0, greedy:true})
        power.operations.operator.configure({filter:(definition)=>definition.part==="powerOp"})
        
        group.configure({mode:ISHML.enum.mode.apt})
            .snip(1)
            .snip(2,number)
        group[1].snip("begin").snip("expression",expression).snip("end")
        group[1].begin.configure({keep:false,filter:(definition)=>definition.part==="begin"})         
        group[1].end.configure({keep:false,filter:(definition)=>definition.part==="end"}) 


reify.dsl.selection.operand[1].snip("leftParen").snip("operand").snip("rightParent")
reify.dsl.selection.operand[1].snip("factorA").snip("operator").snip("factorB")
    .configure({semantics:interpretation=>
    {

        const gist=interpretation.gist
        //gist:{plotLine:{scenes:[],reality:new reify.Reality(),specificity:specificity,wildcard:wildcard},selection:()=>{}}
        gist.selection=()=>
        {
            const a=gist.factor.selection() 
            const b=gist.factorOperations.factor.selection()
            
            /*  if a.length is 0 or b.length there is no intersection
                
            */
            if (a.length===0 || b.length===0) return [] 
            
                /*  if b.length > 0 and b.terms.length is 0 and a has rows, then every thing in a is excluded because there is no correlation to check 
                    example `player carries[something] and [something] is magical except player is magical`
                */
                
                    /*  if b has terms, all shared terms in a and b must match in order for the row in  a to be excluded.
                        examples:
                        `player carries [something] except [something] is magical` a.something must match b.something.
                        `player carries [something] except [something] surface is [quality]` a.something must match b.something.
                    */
                a.forEach(rowA=>
                {
                    for (const rowB of b)
                    {
                        const commonKeys = Object.keys(rowA.terms).filter(key => Object.hasown(rowB.terms,key))
                        if (commonKeys.every((key)=>rowA.terms[key]===rowB.terms[key]))//rowB matched rowA
                        {
                            if gist.factorOperations.factorOperator
                        }
                        
                    }
                })
            
        }
        return true
    }})



reify.dsl.selection.operand.factor
    .snip(0) // atom  DEFECT:for now it's pattern, but need to implement when triggers
    .snip(1) // (grouping)
    .configure({mode:reify.Rule.apt})





expression => term termOperation*
term => factor factorOperation*
factor => pattern | group
termOperation => termOperator term
factorOperation => factorOperator factor
group => leftParen expression rightParen

Alpha network gets created on the fly by instantiating new scenes.  It gets populated by now and tell functions.

`player carries ring` translates to plot.carrying[tense][polarity].player.ring.scenes=[] // 
plot.carrying[tense][polarity].player.ring.activation=Reality //facts that match the pattern

`player carries [something]` translates to plot.carrying[tense][polarity].player.__.etc
`player carries [something]` translates to plot.carrying[tense][polarity].__.player.etc

gist returns a pojo with the following:  scenes array from alpha network, selector function 
gist= {scenes:subplot.scenes,selector:selector,specificity:specificity}

reify.scene.constructor`player carries ring`
{
    interpretations=sceneParser.parse()
    interpretations.foreach.(interpretation=>
    {
        gist=interpretation.gist
        this.selector=gist.selector
        this.specificity=gist.specificity
        gist.scenes.push(this)
    })
}
player tries taking ring =>
player carries ring=>
player took ring=>

predicate`try_taking`
predicate`take`
predicate`carry`

scene`[someone] will take {something]`
.plot(()=>
{
    this.mise.now(_``)
})

scene`[someone] will carry {something]`
.plot(()=>
{
    this.mise.check((term)=>term.someone!==term.something).now`${term.someone} cannot carry themselves.`
})

