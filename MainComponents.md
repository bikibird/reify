1. CFG Parser  (Done)
2. Templating system (Done)
3. Semantic network/rules engine
5. Event Generation(User input and Episodes)
5. Event Handling (scenes)
6. world.js and plot.js (starter pack)
-------1. CFG Parser ------------
    Added boundary character matching which work like separators, but aren't consumed. To do: Document it.
-------2. Templating ------------
    To do: In addition to output to text and html element, add output to fact, now, and scene for more dynamic story options.
-------3. Semantic network ------

https://en.wikipedia.org/wiki/Semantic_network


Reify.js is a JavaScript is a library for writing interactive fiction (also known as text adventures).  With Reify, you describe the story world with facts and write scenes that respond whenever the facts change.

Facts describe how two or more story elements relates relate to each other. Here are some facts which describe the story world in the Cloak of Darkness:

```javaScript
reify.facts`player wears cloak.  foyer is north of bar. foyer is east of cloakroom.  hook is attached to cloakroom.`
```


Facts may look a bit like English, but they are actually structure code. Each fact is composed of two or more terms and a predicate.  Terms are typically nouns, but adjectives may be terms too.  The predicate defines the relationship between the terms.  In the fact **foyer is north of bar**, **foyer** and **bar** are terms and the phrase **is north of** is the predicate describing how foyer and bar relate to each other. When there are more than two terms, the additional terms are separated by prepositions and the predicate is composed of the verb phrase and prepositions.  For example, **Jamal gave ring to Denise** has three terms: Jamal, ring, and Denise. The predicate is for this fact is **give to**.  

Scenes make up the plot of the story.  In interactive fiction scenes are triggered in response to changes in facts.  

reify.scene`when [someone] wears ring and while [someone] is weak.`
    .storyline`[someone] has become enthralled by the ring's power. Beware!`
    .action(()=>
    {
        this.unfold().say() //default wearing response

        this.storylines[0].say()
        
        this.now`[someone] is evil.`
    })
Basic pattern: trigger term | placeholder verb term | placeholder [preposition term | placeholder...]
fact pattern triggers: 
Any pattern without a temporal modifier is triggered by facts created by reify.now.
Any pattern using progressive form is triggered every turn. 
Any pattern using whenever creates a condition that does not trigger.
reify.scene`when [someone] wears ring and while [someone] is weak.`
    .storyline`triggered from a now`
reify.scene`whenever [someone] wears ring and while [someone] is weak.`

    .storyline`Every turn where someone is wearing the `

reify.term`suitcase`
.capacity(0)

reify.suitcase.episode`capacity`
.later`suitcase is full`
.when(capacity=>capacity===10)
.later`suitcase is not full`
.when(capacity => capacity <10)







Terms must be defined separately prior to facts:
```javascript
reify
    .term(id).name().aka()._().assign(id of term already defined to import properties from that term).property1().property2().etc
    .term(id of next term).etc

// Name and aliases are added to lexicon as terms. Names must be unique, but aliases may dupe.
// Yarn means narrative and/or description

reify.term`place`
.place(true)

.term`room`
	.kind`place`
	.room(true)

.term`portal`
	.portal(true)

.term`thing`
	.thing(true)
	.portable(true)

.term`foyer` 
// the underscore property is referred to as the "yarn" and functions as the term's description. It is an instance of a phrase/template
	._`This is the description`
	.aka`alias1`.aka`alias2` \\alternate names
	.kind`room`
	.lighting(.8) //lighting is a fuzzy logic value?
.term`bar`
	.kind`room`  //adds place 
	.lighting(.2)
.term`oak_door`
	.kind`portal`
```
A fact's predicate is an instance of reify.Predicate. A predicate is identified by a verb and one or more prepositions.  Example: player carries ring.   Predicates have tenses: player carried ring. Predicates should not be confused with verbs.  Verbs are commands given by the player, which are translating into facts: player tries going north.
```javaScript
reify.predicate`verb_stem prep1 prep2 etc` // `connect through` `carry` `give to` `take from`
	.present`verb tense` //wake, wake_up
	.past`verb tense` //woke, awoke, woke_up, awaked
	.perfect`verb tense` //awoken, woken, awakened
	.passive`verb tense` // carried by => is carried by, was carried by, had been carried by
    .progressive`verb tense` //carrying
    .adverb`adverb` //provides hint to functions. 
	.adverb`etc`
	???.mutual(true) //foyer abuts bar.  --Implies bar abuts foyer
	???.exclusive(true) // jack is married to jill.   --Implies that if jill marries someone else, the marriage between jack and jill is negated.
	.reify((reality returned from parsing)=>{return reality})  //other relations implied by predicate  connect on north through door1 implies abuts north and south and connects south through door.
	.negate((reality)=>{this.negate(reality)})
	.select() //for virtual predicates  .select`player has ring.` selects player carries or wears ring
	.check() //for virtual predicates .check`player has ring.` checks player carries or wears ring
```
DSL

Declaring facts:

    statements=>(statement period)+  //create one or more facts
    statement=>subject verb directObject prepositionalPhrases*
    subject=>argument 
    prepositionalPhrases=>preposition target
    directObject=>argument
    target=>argument






Facts:

A fact relates terms to each other through a predicate.  Fact are created using 

reify.facts`player carries ring. player wears cape. library contains book.  desk supports pencil.`

A, an, some, the may be added to enhance readability, but do not materially change the fact.

reify.facts`The player carries a ring. The player wears a cape. The library contains a book.  A desk supports the pencil.`

The semantic network is queried using a select statement, which returns a set of Facts called a reality. Use _placeholder_ to specify missing information.
```javaScript
reify.select`[person] carries ring.` 
```




`
"that" and "who" indicates a restrictive clause on the prior term.
select`a person, _stranger_, who lives in the apartment and who owns a pet _animal_ (that runs free or that is carried by alice) and that lost a collar.`



Adjectives may be defined to facilitate writing select and check statements. 

Adjectives may be defined as enums if more than one adjective is listed or Booleans if only one is given.  
For Booleans an opposite adjective may optionally be provided for the false condition. 
if only one adjective is listed and a value is provided it creates a value adjective.  Value may be number, function, or string
if only one adjective is listed and a premise is provided, the term 
if the argument for describes is a string is assumed to be the property of the term. It is equivalent to using term=>term.property===adjective_value


```javaScript
reify
//adds adjectives to lexicon locked:{describes:term=>term.security===0}, unlocked:{describes:term=>term.security===1}
    .adjective`locked,unlocked`.describes`security` 
    .adjective`pass,fail`.describes`exam`           
    .adjective`dark,dim,bright`.describes`lighting` 
    .adjective`locked`.opposite`unlocked`.describes`security` //add adjective to lexicon locked:{describes:term=>term.security===true}, unlocked:{describes:term=>term.security===false}
    .adjective`tall`.describes(term=>term.height>70) // tall:termList=>termList.forEach(term=>term.height>70)
    .adjective`very tall`.describes(term=>term.height>74) // very_tall:
    
    
    
    //adjectives that compare two or more terms (taller or tallest) provide a comparison function, which is used to sort a term list and return the first term.
    //compares() creates the er and est forms of the adjective. 
    .adjective`tall`.describes(term=>term.height>70).compares((a,b)=>a.height>b.height)

    
    //participial adjectives are defined as part of the predicate definition.
    
    //a term intended as a kind will often have attributes associated with it that need to be defined as adjectives.  

    // to


.check`room contains [NPC] and [NPC] is female and [NPC] is tall.`
.check`player is tall`
.select`shiny ring`
.select`chair surface is green` //predicate surface_is
//has is a predicate. Surface is a term. surface is an aspect of chair.  chair functions as an appositive


//default premise for enums and booleans:

term=>term.property===adjective.value
term=>term.security===adjective.locked
term=>term.lighting===adjective.dim





//reify for term properties
reify`A padlock secures the strongbox. `
reify`A key turns the padlock.
reify`The padlock is locked.`  //reify.net.padlock.lock===true
reify`The padlock is unlocked.` //reify.net.strong_box.locked===false
reify`The padlock is not locked.` //reify.net.strong_box.locked===false

reify`The bar is dim.` //reify.net.bar.lighting=1
reify`The bar is dark.`//reify.net.bar.lighting=0
reify`The player has a temperature.`
reify`The strongbox contains treasure.`
reify.net.treasure.worth=100
reify.net.player.temperature=98.6

//adjective locked used before term strongbox
//check returns true or false
if (check`locked strongbox contains ring and player does not have key.`)
{
	this._`You'll have to take the strongbox with you.`
}
//check returns yes, no functions
check`locked strongbox contains ring and player does not have key.`
	.yes(_`You'll have to take the strongbox with you.`)
		.check(`player is strong`)
			.yes(_`You hoist it with ease.`)
			.no(_`The box is too heavy to lift`)
	.no(()=>{_`The box is not locked.  It would be so easy...`; now`player takes ring.`})





//twisty passages 

//use  but to provide instructions to the fact class's reify method. 
reify.reify`A door connects bar to foyer on east, but the door connects nowhere on west. `

reify.reify`A twisty_passage connects bar to foyer on east, but the twist_passage connects foyer to bar on north.`

//Use copula form to assign an adjective's value to a property:

.reify`The ring is dull.`


//use adjectives as term list modifiers:

reify.reify`the magic portal connects opulent _rooms_ to the bar.`  //the magic portal only connects rooms that are opulent

WRONG: .reify`player carries ring that is dull.`  Cannot use copula form with that clause. 
CORRECT: .reify`player carries the dull ring.`


Correct: .reify`ring that player carries is shiny` Changes ring to shiny if the player is carrying it.


.term`fountain`
	.place(true) //not a room, open air

.term`niche`
	.place(true)

```




terms are wrapped in a proxy that exposes the episode method: term.episode("quantity").situation((quantity)=>true).implies(()=>)
predicates are wrapped in a proxy ????? To what purpose

A fact is an instance of reify.Fact and has members {id,subject, verb:directObject,preposition1:indirectObject, prep2:etc, _start, _end, _history}.
Facts are temporal.  They have a start and end measured both in turns and ticks. fact.expire puts an end time on the fact copies the start and end times to fact.history.


A fact's predicate is an instance of reify.Predicate.  
Predicates have tenses and prepositions

Predicates should not be confused with verbs.  Verbs are commands given by the player, which are translating into facts: `player tries_going north.`

reify.predicate`verb_stem prep1 prep2 etc` // `connect through` `carry` `give to` `take from`
	.present`verb tense` //wake, wake_up
	.past.`verb tense` //woke, awoke, woke_up, awaked
	.perfect`verb tense` //awoken, woken, awakened
	.passive`verb tense` //carried by
	.adverb`adverb` //provides hint to functions. 
	.adverb`etc`
	???.mutual(true) //foyer abuts bar.  --Implies bar abuts foyer
	???.exclusive(true) // jack is married to jill.   --Implies that if jill marries someone else, the marriage between jack and jill is nullified.
	.reify((reality returned from parsing)=>{return reality})  //other relations implied by predicate  connect on north through door1 implies abuts north and south and connects south through door.
	.nullify((reality)=>{this.nullify(reality)})
	.select() //for virtual predicates  .select`player has ring.` selects player carries or wears ring
	.check() //for virtual predicates .check`player has ring.` checks player carries or wears ring

if no function is passed to reify and nullify

//adverbs are properties of predicates.

// woods is east of cornfield.  -- implies cornfield is west of woods.
//bar is east of door.  Door is west of foyer.  -- door connects bar to foyer. implies door is west of bar and door is east of foyer
//bar is east of twisty tunnel.  twisty tunnel is north of foyer.  twisty tunnel connects bar to foyer. implies twisty tunnel is west of bar and foyer is south of twisty tunnel.

bar is east of magic portal.  magic portal 
//oak door connects bar to foyer on north.  

//magic portal one-way connects bar to foyer on north. -- adverbs may appear before verb
//WRONG: magic portal connects bar to foyer on north one-way. -- adverbs appears at  end
//WRONG: ring is carried by player safely. -- adverb at end

//foyer is east of bar one-way.
//foyer is one-way east of bar.

//one-way adverb suppresses abuttal and reciprocal connection.

//ring is safely carried by player.
//twisty passage one-way connects bar to foyer on north. twisty passage one-way connects foyer to bar on east.

//predicate verbs are stored in glossary in present (eat, eats) and past (ate eaten) forms.
//In DSL, no attempt is made to match the number and/or person of the term.  player carry and player carries are both valid for present tense.  Similarly, took and taken are treated the same.  Everything is assumed simple present or past tense unless an auxiliary is present.

is/are: present passive form.  example: is carried_by
was: past passive form.  example:  was carried_by
had been: perfect form  example: had been carried_by  --for select/check true if in history, but not currently
//has/have been: are another way to do simple past. don't implement.  Confusing with perfect tense
will: future active form: example will carry 

Negation:

is not/isn't/are/aren't
was not wasn't
had not/hadn't had not been/hadn't

Selection extends Set.  And contains the wildcards 


select`the _room_ occupied by player` //term phrase (article+term wildcard) + participial phrase  Selection.add({_room_})
select`tall _npc_` //term phrase (adjective+term wild card)  Selection.add({_npc_})
select`carried ring` //term phrase (participle + term wildcard) Selection.add({_npc_})
select`_npc_ that carries ring` //term phrase + restrictive clause selection.add(_npc_)
select`_npc_ carries ring`//full fact  selection.add(_npc)
select`_npc_ wears ring`.now`_npc_ is invisible`

Check returns true or false for a fact:

check`player carries ring.`





Doors:


reify`the door connects foyer to bar. The door is east of foyer. The door is west of bar.`

command Go East


select`_destination_ west of _room_ occupied by player.`  //returns a selection {_destination_, _room_,fact}
	.now`player is in destination.` //destination is populated from wildcard name

select`_destination_ west of _room_ occupied by player.`  //returns a selection {_destination_, _room_,fact}
	.check`destination is a portal` 
	.yes(reality=> //filtered by check
	{
		reality.now`player is in _room_ west of destination.` //room is a new wildcard.
	})
	.no(reality=>
	{
		reality.now`player is in destination.`
	})
	




select`player occupies _room_.`  //reality contains {{subject:player, occupy:foyer, _room_:foyer},}
	.where`_room_ is west of _destination_.` //filtering criteria {{subject:player, occupy:foyer, _room_:foyer,_destination_:bar}}
	.check`_destination_ is portal.`		//{{subject:player, occupy:foyer, _room_:foyer,_destination_:bar, portal:true|false}}
	.yes(fact=>                          //{{subject:player, occupy:foyer, _room_:foyer,_destination_:bar, portal:true}}
	{
		now`${fact.subject} occupies  _destination_ through `
		
	}) 
	.no(fact=>                          //{{subject:player, occupy:foyer, _room_:foyer,_destination_:oak door, portal:false}}
	{
		now`${fact.subject} occupies  _destination_ through `
		
	}) 

select`fact. fact. fact...` //union of facts
.where`fact. fact. fact...` //Applies fact filters successively equivalent of where`fact`.where`fact`.where`fact`
.filter(fact=>{return true})  //like where, but more flexible.

.plot`fact`  //operates as select against incoming facts
.where
.filter
.check`fact. fact.`
.check(fact=>)
.yes(fact=>{})
.no(fact=>{})
.now`` //instantiates facts
.now(fact={}) //more flexible version of now
.narrate``.append`#id`


participles may function as adjectives `the shattered vase` .passive`carry` should add an adjective 

participial phrases  are restrictive phrases `the ring carried by the player eaten by the dragon is toxic.`  They follow after the term they are restricting





reify.predicate`connect to through on` 
	.reify((reality,hints)=>{this.reify(fact
	)})  //other relations implied by predicate  connect implies abuts connects 
	.onNullify((fact) =>{})




select`player who knows tony carries _thing_ which is shiny.`
select`_someone_ carries _thing_ which is shiny.`

reify.Predicate("carry").present("carry","carries").past("carried")

reify.Predicate("taking_from").present("takes", "take").past("took","taken").prepositions("from")

arity=1+length of preposition list.

reify.Predicate("carrying_by").present("carried_by","carried_by").past("carried_by", "carried by").perfect("carried by","carried by")
reify.Predicate("waking").present("wake","wakes", "wake_up","wakes_up").past("woke","woke up","woken","woken ).perfect("woken","woken_up")

https://www.thesaurus.com/e/grammar/what-are-the-basic-verb-tenses/

Present tense indicates that the action is currently ongoing.  Past tense indicates the action happened in the past, but says nothing about whether it is happening now. Perfect tense indicates the action happened in the past, but is not happening now

Auxiliary verbs may be supplied in statements to help clarify the tense: is/are/was/been/had/has/have  They are otherwise ignored by the parser. 

reify`ring is carried_by player. flowers are carried_by player.`  //present tense
check`player carries ring. // present tens
check`player ate cake.` //past tense.  player ate cake at some point and may/may not be eating cake now.
check`player had eaten cake.` //perfect tense.  player ate cake at some point, but is not eating cake right now.


Present 
Perfect tense is specifically the past perfect tense and refers to a fact that is currently expired, but had been reified at one time.

A fact's term is an array of POJOs. term[0] is subject.  term[1] is direct object, term[2] is indirect object, etc.  Any arity is allowed and is dictated by the predicate. 

Facts are also terms in their own right and may be related to other terms.

The properties of terms are treated like predicates.

reify.reify`The bar's lighting is dim.` //"'s", "'", and "is" are syntactically meaningless and present just for readability. like all predicates, the property name must be defined in the lexicon.

terms are wrapped in proxies which can trigger an episode when a property changes.

term.upon("health").episode((term)=>{if (term.health <2 and term.heath>0) { return `player faints.`}})

reify.reify adds facts to the net.

Use reify for the initial set up.  Use tell during game play.

Reify DSL:



`player carries ring.`  \\fact is created and run through plot, but no narrative generated.
`now, player carries ring.` \\fact is created, run through plot with narrative generated.






check`jamie who likes player who likes jamie knows player carries _item_ that is shiny and not is inscribed. `

check`jamie knows (player carries _item_. _item_ is shiny. _item_ is not inscribed). jamie likes player. player likes jamie`
check`

reify`foyer exits north to bar.` creates:

reify.net["foyer exits north to bar"]={predicate:exit_to term[foyer,north,bar]}

The creation of a fact may imply other facts. For example exits north implies the opposite exit south relation and is place.    The implied facts are created by triggering the explicit fact's storyline in the plot.  


reify`foyer exits north to bar.` also creates:

reify.net["bar exits south to foyer"]={predicate:exit_to term[bar,south,foyer]}
reify.net["foyer is place"]={predicate:is, term[foyer,place]}
reify.net["bar is place"]={predicate:is, term[bar,place]}

because of storyline`_room1_ exits _direction_ to _room2_`

reify`foyer one_way_exits north to bar.` creates

reify.net["foyer exits north to bar explicitly one-way."]

Also creates:

reify.net["foyer exits north to bar"]
reify.net["bar is place"]={predicate:is, term[bar,place]}




Changing the property of a term with reify triggers matching storylines.

reify`bar lighting is dim`  //look up dim in the lexicon. If not present, use text "dim"
reify`bar lighting is ${5}`
reify`bar lighting is ${()=>5}`


reify.storyline`bar lighting is ___.`  //match any change to lighting
reify.storyline`bar lighting dim.`
reify.storyline`bar lighting ${5}.`
reify.storyline`bar lighting ${()=>5}.`



reify`kathy knows (john proposed_to mary).` creates:

reify.net["kathy knows (john proposed_to mary)"]={predicate:knows term[kathy,{predicate:proposed_to,term:[john,mary]}]} 

A fact is a predicate + n terms.
A reality is a set of facts

reify.net contains terms and fact stored as key/value  pairs.  It mainly exists so that facts and terms can be retrieved when they are exactly know. 

Each predicate and term has an _index property.

The predicate index is a reality of facts in which the predicate appears.

The term index is an array of realities corresponding to the term's position in th the facts. 

The purpose of the indexes is to allow quick retrieval of facts when incomplete information is known.

fact 'player carries ring` is indexed as follows

player._index[0]=reality of facts containing player in any term position 0, the subject 
ring._index[1] =reality of facts containing ring in any term position 1, the direct object 
carry._index=reality of facts containing predicate carry

fact player_gave_ring_to_nancy is indexed as follows

player._index[0]=reality of facts containing player in any term position 0, the subject 
ring._index[1]=reality of facts containing ring in any term position 1, the direct object
nancy._index[2]=reality of facts containing player in any term position 2, the indirect object 
give_to._index=reality of facts containing predicate carry

reify.select`player carries ___` //returns player_carry_ring    
    player._index[0].intersection(carry.index)
    
reify.select`ring carried by ___`//returns player_carry_ring
    ring._index[1].intersection(carry.index) //returns all facts from _index[1]  that matches carries

reify.select`player ___ ring` //returns player_carry_ring and player_give_ring_to_nancy
    player._index[0].intersection(ring.index[1])  //returns all facts from _index











Each term, predicate, and fact are stored in reify.net as a key/value pair.  

_index[0...n] //zero is predicate, 1 is term1, 2 is term2, etc.

_index[0].entity.facts
_index[0].entity._index[0...n].another_entity.facts

_index[0].exit_to._index[1].foyer.facts 

_index[1].foyer._index[2].north.facts




Searching:

Divide search string into wildcards, predicate and term strings of each fact, recursively for compound facts.

Retrieve predicate and terms from reify.net.

retrieve facts for first term from reverse index checking for term position match and predicate match. Check remaining terms against term position of fact.  Put passing facts into a set to weed out dupes.  




reify.select retrieves a pojo whose members are arrays corresponding the blanks provided in the criteria. 

When select query is in fact form (complete sentence) a reality of facts are returned:

reify.select`_what_ contains ring?` //returns reality of facts {fact members, _what_:$.box}
reify.select`box contains _what_?` // returns reality of facts{ fact members,_what_:$.ring,}{fm,  $.coin}
select`_what_ contains _something_`//returns  reality of facts. each fact has _what_ and _something_ property
suspects=reify.select`_who_ ate the cake?` //returns reality of facts each fact has a _who_ property

When select query only contains a subject and its restrictive clauses, an array of terms are returned

select`tall _people_ who carry a ring that is not iron` [$.tony, $.jane]






suspects.forEach(suspect=>
{
	fact=suspect.fact.who
	term=suspect.who
	reify.reify`Parker arrested ${suspect.who.id}.`
})

suspects=reify.select`_suspect_ ate the cake.`
suspects.reify`parker arrested suspect.`

reify
	.select`_suspect_ ate the cake.`
	.reify`parker arrested suspect.`



Internally, reify places facts into a Reality, a class based on Set, to weed out duplicates then writes them out to an array with au

reify.check returns a boolean representing whether the query returned any facts or not. 





reify.reify`Player wears ring.` Player is the subject, ring, the object. The two are joined through the predicate wears.  The reverse wearing relation `ring worn_by player` is not stored because it is not needed for the fill in the blanks query language.

Some 1-ary relations are not truly 1-ary  `player ate.` Is really `player ate food`.  `player jumped` is really `player jumped up`  True 1-aries 

terms, predicates, and facts are entities stored in the knowledge base by their ids.  The id of a  fact the ids of the subject,predicate,term concatenated together: player_wears_ring.

Facts with arity greater than 2 may have the predicate id split up: reify.reify`john gave ring to mary` has a predicate gave_to.  Predicate is stored in database as gave_to.  Term list is john, ring, mary.

reify.reify`john gave ring to mary` adds the following to the knowledge base.

john_gave_ring_to_mary={predicate:reify.net.gave_to,term:[reify.net.john,reify.net.ring,reify.net.mary]}
gave_to=predicate
john={}
ring={}
mary={}



reify.select`john gave ___ to ___?` returns john_gave_ring_to_mary fact
reify.select`john gave _gift_ to _whom_?` returns new fact based on john_gave_ring_to_mary that also includes {gift: term[1], whom:term[2]}

compound facts are facts about facts




Reify creates facts.  Nullify ends them. Check returns boolean.  Select returns facts or subjects meeting the specified criteria


reify.reify`${{id:"bar",description:"a dank and dusty den",name:"Dimby's Bar"}} exits north to ${{id:"foyer",description:"a cheerful and welcoming place"}}.`
reify.reify`${{id:"locket",description:"a beautiful locket"}} is thing. Bar contains locket.`
reify.select`_term1_ contains locket.`  //Returns all facts where term1 contains locket.
reify.check`bar contains locket.` //Return true if at least one fact matches the pattern.

reify.reify``._`` //narrates without going through plot. 
reify.reify`` //reifies silently
reify.now`reify statement` //reifies and checks plot for implications.

Negative facts:

Select only works on existing facts.  

reify.select`player does not carry ring` only works if the `player carries ring` fact exists with negative polarity.  
reify.check`player does not carry ring` returns true if fact exists with negative polarity or fact does not exist at all.

reify.select`player carries _item_`.filter`#item is not shiny`



-------4. Event Handling------- 
The player interacts with the story through text input, clicking, drag/drop.  The reify event handlers associated with these inputs and turns the input into a reify statements. 

Reifying triggers matching scenes. scenes change the webpage through narration and update the semantic network through unfolding. The unfolding may trigger additional scenes by reifying or by updating the properties of terms.

Changing a term's property generates a reality from a reify of the form `theTerm changed property` which will then be matched against scenes `theTerm is theAdjective`

For pure choice based fiction that does not do a lot of tracking of the world state, it may be inconvenient to create terms and predicate just to match a scene. It is possible to link a scene directly by declaring the scene with a handle using @, for example reify.scene`@exciting denouement`  The scene may then be called directly with reify.tell`exciting denouement`.

Scene only works on new facts.

reify.scene and its subsidiaries compose and return a single function which is index in the terms and predicates identified in .scene``


reify.scene`player wears cardigan or player does not wear cap.` //Triggers scene when players puts on cardigan or takes off hat.
    ._`a narrative`.append`#story` //One possible storyline
    ._`another narrative`.replace`#story` //another one
    ._`another narrative`.prepend`#story` //etc.
    .action(reality=>
    {
        this.storyline[0].say(reality)
        this.now`vase is broken.` //triggers scenes involving the vase. Suppresses text output
        this.unfold() //process the next (in terms of specificity) qualifying scene. suppresses text output
    })   

scene`player carries shiny or dull ring.`
    .action((reality)=>
        {
            
            reify.now`player is lucky.`.say()  //now returns function to update page
            reify.unfold().say() //unfold returns function to update page
        })
    ._`That's a nice ring!`




//A when condition may be specified to limit where the scene applies.  The condition does not cause triggers to fire. Condition contributes to specificity score.

reify.scene`player wears cardigan.`
    .when`player does not wear cap.` //scene is not triggered when player takes off cap, because it is in the when. Only triggers when cardigan is worn.

reify.scene`player does not wear ring` //only triggers when  `player wears ring` is created or updated with negative polarity.  
.when`player does not wear amulet` //evaluate to true if `player wears amulet` has negative polarity or does not exist.
.now`player is visible`
.append`#story`._`You are visible once more.`

reify.scene`player wears ring` //only triggers when  `player wears ring` is created or updated with negative polarity.  
.append`#story`._`You are visible once more.`

reify.scene`player carries ring` //only triggers when  `player wears ring` is created or updated with positive polarity
.append`#story`._`You fade gently away, with only your breathing and footsteps to give you away.`





reify.scene`The player tries going north.`action((reality)=>)
reify.scene`The player is ill.`.actiong(()=>)  // copula applies ill adjective to player's health for match

reify.plot={} //members are scenes.

reify.scene`select statement`.action((reality)=>{})._`` // adds a scene to the plot. It includes a select statement to match to a reality, an action function and a narration.


reify.scene`_someone_ tries going`.action((reality)=>{//update world model})._`narrative`

scene`statement` is parsed as a reify select statement and then compared to the incoming reality from now.
scene`@handle` matches handle provided by reify.tell`handle`

All terms and predicates must be defined before scenes are defined because scenes are indexed in the terms

reify.scene`_person_ takes shiny ring.` //The scene is indexed in ring.
reify.scene`player takes shiny ring.` //The scene is indexed in both player and ring.
reify.scene`@player takes shiny ring.` //handle scenes are indexed in the plot only for choice based fiction.

reify.scene`player passed ball to alice`
    .when`alice is sleepy.`



reify.scene`player wears cardigan. player wears cap.`

reify.scene`player wears cardigan.`
    .when`player does not wear cap.`
reify.scene`player wears cardigan.` 
    .scene`player does not wear cap.`
    //Chose one position for unfold.
    .unfold() //unfold before now and append
    .now`player is out of uniform. coach is aghast.`
    .unfold() //unfold after now, but before append
    .append`#story`._`Sartorially, you are not so splendid.`
    .unfold() //unfold after now and append

Within the action, calling this.unfold() will call the scene that applies but is less specific to the situation. It works like bubbling events in javascript


reify.scene`player does not wear jacket.`.implies`complaining mood`
reify.scene`player wears jacket and player wears rose colored glasses.`.negates`complaining mood`
reify.scene`player takes _something_ and complaining mood`
.unfoldBefore()
.action((scene)=>  //define an action if you to unfold or you have a more complex behavior.
{
    scene.append('#story').narrate()
    reify.unfold()
})
.now`player carries #something#.`
.append`#story`._`It's probably useless.`

.unfoldAfter()

reify.scene`_someone_ does not wear jacket.`.implies`_someone_ is in a complaining mood`

reify.scene`_someone_ wears _something_ or _someone_ carries _something_`.implies`_someone_ has _something_` 









reify.storyline().onReify`sally tried going.`.unfolding((reality)=> //storyline is assigned an id.
{
	plot.going.unfold(reality)
	blah blah...
})  //after
reify.plot.storyline().on `sally tried going`.unfolding((reality)=>{
	blah blah...
	plot.going.unfold(reality)
})  //before
reify.plot.storyline`sally tried going`.unfolding((reality)=>
{

})  //instead

reify.plot.storyline`___ tried going`.action((reality)=>
{
	reality.forEach((fact)=>
	{
		reify.reify.`now, ${fact.term1} in ${fact.term2}`
	})
})

reify.storyline`player tried ordering_dinner`
	._`Would you like <a onClick=reify.reify`player tried ordering_soup`>soup</a> or 
						<a onClick=reify`player tried ordering salad`>salad/<a>.`
reify.storyline`player tried ordering_soup`
	._`Very good, one soup.`
	.unfolding`player ordered soup.`

reify.storyline`_room1_ exits _direction_ to _room2_`
	.unfolding`ROOM1 is place. ROOM2 is place. ROOM2 exits ${oppositeDirection[DIRECTION]} to ROOM1.`
reify.storyline`_room1_ exitsOneWay _direction_ to _room2_`
	.unfolding`ROOM1 is place. ROOM2 is place.`

reify.storyline`_room1_ exits _direction_ to _room2_`.unfolding((_room1_,_direction_,_room2_)=>{})

Instead of reify.plot 

reify.storyline`player tried ordering_dinner`  //onchange

reify.storyline`${reify.turn===10} and player tried ordering dinner.`
reify.storyline`${reify.tick > 99} and bomb is set.`
	.implies`bomb explodes.`
reify.storyline(reify.turn<10)
	._`You're new here.`
reify.storyline(reify.turn>9)`
	._`You're an old hand.`


***************** 6. Colossal.js *****************

built-in predicates:

bar abuts foyer on north.
ring abuts on (left, right, behind, front)
bar contains ring.
table supports ring.
table covers ring.  // ring is underneath the table

player carries ring.
player wears ring.
bar connects foyer on north.  //implies a portal. implies abutting. implies two-way passage.  Can we get away with not implying a portal. How does missing terms affect querying?
bar connects foyer through door1 on north.

  //portal is door1. implies adjoining. implies two-way passage
bar connects foyer on north through door.  //Order of prepositions shouldn't matter, but it does because of indexing facts.  Do facts need to be indexed?

bar one-way_exits_to foyer on north //implies a portal. Does not apply abutting. Does not imply two-way connection

reify`the bar connects the foyer to the north.`
//non-enumerable

fact.id="bar_connects_foyer_to_north_through_portalN"  //non-enumerable
fact.predicate="connects_to_through" //non-enumerable

//enumerable
fact.subject={bar}
fact.connects={foyer}
fact.to={north}
fact.through={portalN}

reify.net.bar={bar}
reify.net.foyer={foyer}
reify.net.bar_connects_foyer_to_north_through_portalN={bar_connects_foyer_to_north_through_portalN}
reify.net.term1.bar={bar_connects_foyer_to_north_through_portalN}
reify.net.term2.foyer={bar_connects_foyer_to_north_through_portalN}
reify.net.term3.portalN={bar_connects_foyer_to_north_through_portalN}
reify.net.verb.connects={bar_connects_foyer_to_north_through_portalN}
reify.net.predicate={connects_to_through}

reify`player carries ring.`

fact.id="player_carries_ring"
fact.predicate="carries"

fact.subject={player}
fact.carries={ring}

reify.net.player={player}
reify.net.ring={ring}
reify.net.player_carries_ring={player_carries_ring}

reify.net.term1.player={player_carries_ring}
reify.net.term2.ring={player_carries_ring}
reify.net.verb.carries={player_carries_ring}
reify.net.predicate.carries={player_carries_ring}


ERROR 0001: Adjective ${this.id} describes undefined.
ERROR 0002: Unable to assign kind ${kind} to ${target.displayName}.
ERROR 0003: Unable to format id.
ERROR 0004: Unable to format name.
ERROR 0005: Unable to parse reify source code.
ERROR 0006: Unable to parse reify source code-- no interpretations.
ERROR 0007: Unable to parse reify source code-- more than one interpretation.
ERROR 0008: Wildcard not permitted for subject. Fact ${index+1}:"${fact.lexeme}."
ERROR 0009: Wildcard not permitted for verb. Fact ${index+1}:"${fact.lexeme}."
ERROR 0010: Wildcard not permitted for target. Fact ${index+1}:"${fact.lexeme}."
ERROR 0011: Wildcard not permitted. Fact ${index+1}:"${fact.lexeme}."





