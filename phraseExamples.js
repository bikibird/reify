var _ = reify.template._

//1-1
var myPhrase = _`Hello, ${_.cycle.shuffle("Mecury","Venus","Earth","Mars","Jupiter","Saturn","Uranus","Neptune")}`
myPhrase.say().replace("#greeting")

//1-2
var example1 = _`Hello, world.`  //template literal notation
var example2a = _("Venus","Earth","Mars") //simple list
var example2b = _(["Venus","Earth","Mars"]) //simple list
var example3a = _([{value:"Venus", position:2},{value:"Earth", position:3},{value:"Mars", position:4}])// complex list
var example3b = _({value:"Venus", position:2},{value:"Earth", position:3},{value:"Mars", position:4})// complex list
var example4a = _`Hello ${example3a}.`  //nested template
var example4b = _`Hello ${_("Venus","Earth","Mars")}.`  //inline nested 
var example5a =_(example1, example4a, "Hello, darkness my old friend.") //mixed list of phrases and strings
var example5b =_([example1, example4b, "Hello, darkness my old friend."]) //mixed list of phrases strings
var example6a =_()  //Deferred population
var example6b =_``  //Deferred population

//1-3
var planets = _.pick("Venus","Earth","Mars") 
var greeting =_`Hello, ${planets}.`    
//populate by simple list
planets.populate("Mercury","Ceres","Pluto","Jupiter","Saturn") 
//populate by complex data
planets.populate({value:"Venus", position:2},{value:"Earth", position:3},{value:"Mars", position:4})
planets.populate([{planet:"Venus", position:2},{planet:"Earth", position:3},{planet:"Mars", position:4}])    
//populate nested phrase
var myPhrase=_`Hello, ${_.PLANET.pick()}. ${_.REMARK.pick()}`
myPhrase.populate({planet:["Venus","Earth","Mars"],remark:["Long time no see.","I'm home.","Good to be back."]})

//1-4
var myPhrase = _`Hello, ${_.cycle.shuffle("Mecury","Venus","Earth","Mars","Jupiter","Saturn","Uranus","Neptune")}. `

myPhrase.say()

console.log(myPhrase.text) 
console.log(myPhrase.say().text)

var demo=function()
{
	myPhrase.say().replace("#paragraph1")
  myPhrase.say().append("#paragraph2")
  myPhrase.say().prepend("#paragraph3")
}

//2-1
var unmodifiedPhrase = _`${_("Jack","Jill","Jamal")} went to the humane society and came home with ${_("dog","cat","ocelot","emu")}. `
var pickPhrase = _`${_.pick("Jack","Jill","Jamal")} went to the humane society and came home with ${_.a.pick("dog","cat","ocelot","emu")}.`
var cyclePhrase = _`${_.cycle("Jack","Jill","Jamal")} went to the humane society and came home with ${_.a.cycle("dog","cat","ocelot","emu")}. `

var demo=function()
{
   unmodifiedPhrase.say().replace("#paragraph1")
   pickPhrase.say().replace("#paragraph2")
   cyclePhrase.say().replace("#paragraph3")
}

//2-2
var example1 =_.a.list("dog","cat","ocelot","emu")
var example2 =_.list.a("dog","cat","ocelot","emu")
var example3 =_.cap.a.list("dog","cat","ocelot","emu")
var example4 =_.a.list.cap("dog","cat","ocelot","emu")
var demo=function()
{	
  example1.say().replace("#paragraph1")
  example2.say().replace("#paragraph2")
  example3.say().replace("#paragraph3")
  example4.say().replace("#paragraph4")
}

//2-3
var rollPhrase = _`I ran a 5K race and ${_.roll("won","took second place","placed third","lost","sprained my ankle")}.`
var pickPhrase = _`I ran a 5K race and ${_.pick("won","took second place","placed third","lost","sprained my ankle")}.`
var favorPhrase = _`I ran a 5K race and ${_.favor("won","took second place","placed third","lost","sprained my ankle")}.`
var shufflePhrase = _`I ran a 5K race and ${_.cycle.shuffle("won","took second place","placed third","lost","sprained my ankle")}.`

var demo=function()
{
   rollPhrase.say().replace("#paragraph1")
   pickPhrase.say().replace("#paragraph2")
   favorPhrase.say().replace("#paragraph3")
   shufflePhrase.say().replace("#paragraph4")
}

//2-4
var example1 = _`I ran a 5K race and ${_.roll("won","took second place","placed third","lost","sprained my ankle")}.`
var example2 = _`I ran a 5K race and ${_.roll("won","took second place","placed third","lost","sprained my ankle")}.`.seed(0.123)
var example3 = _`I ran a 5K race and ${_.roll("won","took second place","placed third","lost","sprained my ankle")}.`

var demo=function()
{
  example1.say().replace("#paragraph1")
  example2.say().replace("#paragraph2")
  example3.say(0.456).replace("#paragraph3")
}
//2-5
var _ = ishml.template._
var reshufflePhrase = _`I ran a 5K race and ${_.cycle.shuffle("won","took second place","placed third","lost","sprained my ankle")}.`
var oneShufflePhrase = _`I ran a 5K race and ${_.cycle.pin.shuffle("won","took second place","placed third","lost","sprained my ankle")}.`
var stickyPickPhrase = _`I ran a 5K race and ${_.pin.pick("won","took second place","placed third","lost","sprained my ankle")}.`

var demo=function()
{
  reshufflePhrase.say().replace("#paragraph1")
  oneShufflePhrase.say().replace("#paragraph2")
  stickyPickPhrase.say().replace("#paragraph3")
}

//2-6
var cyclePhrase = _.cycle("I will keep saying it forever. ","I have a right to speak my truth. ","You can't stop me. ")
var seriesPhrase = _.series("Don't make me repeat myself. ","You've already heard it once. ","I won't say it again. ")
var seriesThenTextPhrase = _.series("Don't make me repeat myself. ","You've already heard it once. ","I won't say it again. ")
.then`I've said enough. `

var seriesThenPickPhrase = _.series("Don't make me repeat myself. ","You've already heard it once. ","I won't say it again. ")
.then.pick("Mums the word. ","My lips are sealed. ", "That would be telling. ")

var demo=function()
{
  cyclePhrase.say().append("#paragraph1")
  seriesPhrase.say().append("#paragraph2")
  seriesThenTextPhrase.say().append("#paragraph3")
  seriesThenPickPhrase.say().append("#paragraph4")
}

//2-7
var example1 = _`I saw him ${_.pick("walk","skip","ski","limp").ing} down the street. `
var example2 = _`<del>${_.cap.list("walk","skip","ski","jump").ing} are all good exercise.</del>`
var example3 = _`${_.cap.list.PLACE("walk","skip","ski","jump").ing} are all good exercise.`
example3.populate({PLACE:["test","abc"]})
var demo=function()
{
   example1.say().replace("#paragraph1")
   example2.say().replace("#paragraph2")
   example3.say().replace("#paragraph3")
}

//3-1
var example1=_`Carmen has a pet ${_.PET.pick("dog","cat","emu","octopus")}. 
Saul has ${_.a.next.pet()}.  I saw his ${_.pet()} yesterday. `

var example2=_`Carmen has ${_.PET.a.pick()}, but ${_.pet.problem()}.
Is ${_.pet()} right for you?  
A pet ${_.ante.ante.pet()} is not right for me.`

example2.fill({pet:[{animal:"dog",problem:"they shed a lot"},
{animal:"cat",problem:"I'm allergic"},
{animal:"emu",problem:"they can be temperamental"},
{animal:"octopus",problem:"they get bored easily"}]})

var example3=_`The humane society has ${_.list(_.PETS("dog","cat","emu","octopus").s).PET_LIST}. 
I've always wanted ${_.MY_PET.a.pick.pets()}.  
I wish I could take home all the ${_.pet_list()},
but I should just get ${_.my_pet()}.`

var example4=_`My pet ${_.PET.pick().animal.name} is ${_.a.pet.animal.type()}.`

example4.fill({pet:[{animal:{type:"dog",name:"Spot"}},{animal:{type:"cat",name:"Fluffy"}},{animal:{type:"spider",name:"Ida"}}]})

var demo=function()
{
   example1.say().replace("#paragraph1")
   example2.say().replace("#paragraph2")
   example3.say().replace("#paragraph3")
   example4.say().replace("#paragraph4")
}

//3-2

var example1=_`${_.PLAYER.cycle.shuffle("Marta","Tony","Jalisa","Edgar","Xong","Lucy")} placed ${_.player.rank()} out of ${_.player.total()}. ${_.player().modify(p=>p.rank===1?"Great job!":"Better luck next time.")} `

var example2=_`${_.PLAYER.series.shuffle("Marta","Tony","Jalisa","Edgar","Xong","Lucy")}`
.also` placed ${_.player().rank} out of ${_.player().total}. ${_.player().modify(p=>p.rank===1?"Great job!":"Better luck next time.")} `
.then` Thanks to all the particpants.`

var demo=function()
{
	 example1.say().replace("#paragraph1")
   example2.say().replace("#paragraph2")
}
//3-3
var example1=_`${_.PLAYER.cycle.shuffle("Marta","Pat","Jalisa","Edgar","Xong","Lucy").first(3)} placed ${
_.cycle("first","second","third")}. `.per.player()

var demo=function()
{
	 example1.say().replace("#paragraph1")
  
}

//3-4

var data={person:[
{name:"Marta",possessive:"her",interest:"needlework"},
{name:"Pat",possessive:"their",interest:"boardgames"},
{name:"Jalisa",possessive:"her",interest:"boardgames"},
{name:"Edgar",possessive:"his",interest:"performing"},
{name:"Xong",possessive:"her",interest:"needlework"},
{name:"Lucy",possessive:"her",interest:"performing"},
],
hobby:[
{name:"knitting",interest:"needlework"},{name:"embroidery",interest:"needlework"},{name:"tatting",interest:"needlework"},
{name:"chess",interest:"boardgames"},{name:"checkers",interest:"boardgames"},{name:"parchisi",interest:"boardgames"},
{name:"dancing",interest:"performing"},{name:"singing",interest:"performing"},{name:"acting",interest:"performing"},
]}
var example1=_`${_.PERSON.cycle.shuffle()} enjoys ${
_.pick(_.HOBBY().interest.match.person.interest()).name} in ${
_.person.possessive()} spare time.`.populate(data)

var demo=function()
{
	 example1.say().replace("#paragraph1")
  
}

// 4-1
var animal =_.pick("gnat","ant","elephant")
//WRONG!!! Intended to create two phrases that are independent of each other,
//but example1 and example2 both point to animal.
var example1=animal.populate("frog","toad","newt")
var example2=animal.populate("mouse","rat","chipmunk")
var demo=function()
{
  example1.say().replace("#paragraph1")
  example2.say().replace("#paragraph2")
   
}

//4-2  corrected version of 4-1

var animal =(...data)=>_.pick(...data)
var example1=animal("frog","toad","newt")
var example2=animal("mouse","rat","chipmunk")
var demo=function()
{
  example1.say().replace("#paragraph1")
  example2.say().replace("#paragraph2")
}


//4-3

var example1=_`<ul>${_`<li>${_.LI.cycle()}</li>`.per.li()}</ul>`
var data={li:[{value:"cat"},{value:"dog"},{value:"bird"}]}
example1.populate(data)

var ul=(...data)=>_`<ul>${_`<li>${_.LI.cycle()}${_.li.li().expand(ul)}</li>`}</ul>`.per.li().populate({li:data.flat()})

var example2=ul([{value:"cat",li:[{value:"worried",li:["meow","hiss"]},{value:"happy",li:["purr"]}]},{value:"dog",li:["bark","growl"]},{value:"bird"}])

var demo=function()
{
   example1.say().replace("#paragraph1")
   example2.say().replace("#paragraph2")

}

//4-4

var inside=box=>_`Inside the ${_(box)} was a ${_.CONTENTS.favor(_.CONTAINER.pick("steel strongbox","wooden casket","silk bag","paper sack","old purse"),
_.pick("ring","ancient coin", "ruby"))}.
${_.contents().match.container().expand(inside)}
${_`She put the ${_.contents()} back in the ${_(box)}. `}`

var example1=_`Cas looked under the bed and found a package wrapped with a red ribbon.  Carefully, she unwrapped the package.
${inside("package")}Cas rewrapped the package and put it back under the bed.  ${_.pick("No one would be the wiser. ", 
"Now she knew. ", "She was elated. ", "She was disappointed.")}`

var demo=function()
{
   example1.say().replace("#paragraph1")
}

//5-1

var _=ishml.Template
var example1=_.pick("run","jump","skip").modify(item=>item.value.toUpperCase())

var prefix=(...data)=> _(...data).modify(item=>item.value.toUpperCase())
ishml.Template.define("shout").as(prefix)
example2=_.shout.pick("run","jump","skip")

var suffix=(...data)=> _(...data).modify(item=>item.value+"-O-Tron")
ishml.Phrase.define("tron").as(suffix)
var example3=_.cap.pick("run","jump","skip").tron

var demo=function()
{
   example1.say().replace("#paragraph1")
   example2.say().replace("#paragraph2")
   example3.say().replace("#paragraph3")
 }
