reify.Passage =class Passage
{
	constructor(...precursor) 
	{
		Object.defineProperty(this,"id",{value:"",writable:true})
		Object.defineProperty(this,"echo",{value:false,writable:true})
		Object.defineProperty(this,"ended",{value:false,writable:true})
		// Object.defineProperty(this,"_locked",{value:false,writable:true})  Not used anywhere
		Object.defineProperty(this,"_erasable",{value:false,writable:true})
		Object.defineProperty(this,"passages",{value:[],writable:true})
		Object.defineProperty(this,"re",{value:false,writable:true})
		Object.defineProperty(this,"_property",{value:"",writable:true})
		Object.defineProperty(this,"_results",{value:[],writable:true})
		Object.defineProperty(this,"_seed",{value:reify.util.random().seed,writable:true})
		Object.defineProperty(this,"_tag",{value:"",writable:true})
		Object.defineProperty(this,"tags",{value:{},writable:true})
		Object.defineProperty(this,"text",{value:"",writable:true})
		this.fill(...precursor)
		this.catalog()
		return new Proxy(this, reify.Passage.__handler)
	}
	get also()  //Joins second passage if first passage generates non empty string
	{
		var primaryPassage=this
		return new Proxy((...precursor) => new class alsoPassage extends reify.Passage
		{
			constructor()
			{
				super()
				this.passages[0]=primaryPassage
				this.passages[1]=new reify.Passage(...precursor)
				this.catalog()
			}
			generate()
			{
				var results=this.passages[0].generate()
				if (results.length>1 || (results.length===1 && results[0].value!==""))
				{
					this.results=results.concat(this.passages[1].generate())
					this.text=this.toString()
				}
				else
				{
					this.results=results
					this.text=""
				}
				return this.results
			}
		},reify.template.__handler)
	}
	get when()
	{
		var primaryPassage=this
		return new Proxy((...precursor) => new class whenPassage extends reify.Passage
		{
			constructor()
			{
				super()
				this.passages[0]=primaryPassage
				this.passages[1]=new reify.Passage(...precursor)
				this.catalog()
			}
			generate()
			{
				this.passages[1].generate()
				if (this.passages[1].text)
				{
					this.passages[0].generate()
					this.text=this.passages[0].text + this.passages[1].text
					this.results=[{value:this.text}]
				}
				else
				{
					this.results=[{value:""}]
					this.text=""
				}

				return this.results
			}
		},reify.template.__handler)
	}
	get _() //joins two passages without space
	{
		var primaryPassage=this
		return new Proxy((...precursor) => new class spacePassage extends reify.Passage
		{
			constructor()
			{
				super()
				this.passages[0]=primaryPassage
				this.passages[1]=new reify.Passage(...precursor)
				this.catalog()
			}
			generate()
			{
				super.generate()
				this.text=this.toString()
				return this.results
			}
		},reify.template.__handler)
	}
	get spc()  //joins two passages with space
	{
		var primaryPassage=this
		return new Proxy((...precursor) => new class spcPassage extends reify.Passage
		{
			constructor()
			{
				super()
				this.passages[0]=primaryPassage
				this.passages[1]=new reify.Passage(...precursor)
				this.catalog()
			}
			generate()
			{
				var results1=this.passages[0].generate()
				var results2=this.passages[1].generate()
				if (
					(results1.length>1 || (results1.length===1 && results1[0].value!=="")) &&
					(results2.length>1 || (results2.length===1 && results2[0].value!==""))
				){var space=" "}
				else{var space=""}
				
				this.results=results1.concat([{value:space}],results2)
				this.text=this.toString()
				return this.results
			}
		},reify.template.__handler)
	}
	get spc1()  //joins 2 passages with space  if first passage generates non-empty string. 
	{
		var primaryPassage=this
		return new Proxy((...precursor) => new class spc1Passage extends reify.Passage
		{
			constructor()
			{
				super()
				this.passages[0]=primaryPassage
				this.passages[1]=new reify.Passage(...precursor)
				this.catalog()
			}
			generate()
			{
				var results1=this.passages[0].generate()
				var results2=this.passages[1].generate()
				if (
					(results1.length>1 || (results1.length===1 && results1[0].value!=="")) &&
					(results2.length>1 || (results2.length===1 && results2[0].value!==""))
				) {this.results=results1.concat([{value:" "}],results2)}
				else {this.results=results1}
				this.text=this.toString()
				return this.results
			}
		},reify.template.__handler)
	}
	get spc2()  //joins 2 passages with space  if and only if both passages generate non-empty strings. 
	{
		var primaryPassage=this
		return new Proxy((...precursor) => new class spc2Passage extends reify.Passage
		{
			constructor()
			{
				super()
				this.passages[0]=primaryPassage
				this.passages[1]=new reify.Passage(...precursor)
				this.catalog()
			}
			generate()
			{
				var results1=this.passages[0].generate()
				var results2=this.passages[1].generate()
				if (
					(results1.length>1 || (results1.length===1 && results1[0].value!=="")) &&
					(results2.length>1 || (results2.length===1 && results2[0].value!==""))
				) {this.results=results1.concat([{value:" "}],results2)}
				else {this.results=[{value:""}]}
				this.text=this.toString()
				return this.results
			}
		},reify.template.__handler)
	}
	get comma()  //joins two passages with , or space
	{
		var primaryPassage=this
		return new Proxy((...precursor) => new class spacePassage extends reify.Passage
		{
			constructor()
			{
				super()
				this.passages[0]=primaryPassage
				this.passages[1]=new reify.Passage(...precursor)
				this.catalog()
			}
			generate()
			{
				var results1=this.passages[0].generate()
				var results2=this.passages[1].generate()
				if (
					(results1.length>1 || (results1.length===1 && results1[0].value!=="")) &&
					(results2.length>1 || (results2.length===1 && results2[0].value!==""))
				){var space=", "}
				else{var space=" "}
				
				this.results=results1.concat([{value:space}],results2)
				this.text=this.toString()
				return this.results
			}
		},reify.template.__handler)
	}

	get comma2()  //joins two passages with , or period
	{
		var primaryPassage=this
		return new Proxy((...precursor) => new class spacePassage extends reify.Passage
		{
			constructor()
			{
				super()
				this.passages[0]=primaryPassage
				this.passages[1]=new reify.Passage(...precursor)
				this.catalog()
			}
			generate()
			{
				var results1=this.passages[0].generate()
				var results2=this.passages[1].generate()
				if (
					(results1.length>1 || (results1.length===1 && results1[0].value!=="")) &&
					(results2.length>1 || (results2.length===1 && results2[0].value!==""))
				){var space=", "}
				else{var space=". "}
				
				this.results=results1.concat([{value:space}],results2)
				this.text=this.toString()
				return this.results
			}
		},reify.template.__handler)
	}

	append(documentSelector)
	{
		if (documentSelector)
		{
			var targetNodes = document.querySelectorAll(documentSelector)
			targetNodes.forEach(node=>node.append(this.htmlTemplate().content))
		}	
		return this
	}
	catalog()
	{
		this._catalogUp()
		this._catalogDown()
		return this
	}
	_catalogUp() //add child tags and this tag to this's tags 
	{
		if (this.id)
		{
			this.tags[this.id]=this  //Add this to its own tags
		}
		this.passages.forEach(passage=> 
		{
			if (passage instanceof reify.Passage )
			{
				var tags= passage._catalogUp()  // recursive catalog for sub passages
				Object.keys(tags).forEach(key=>
				{
					if(!this.tags[key])
					{
						this.tags[key]=tags[key] //add sub passages to this's tags
					} 
				})
			}
		})
		return this.tags
	}
	_catalogDown()
	{
		this.passages.forEach(passage=>
		{
			if (passage instanceof reify.Passage)
			{
				Object.keys(this.tags).forEach(key=>
				{
					if (!passage.tags[key])
					{
						passage.tags[key]=this.tags[key]  //add selfs tags to sub passages
					}	
					passage._catalogDown()  //recursively
				})
			}	
		})
	}

//There are three different ways to specify a condition.
//Concur should work like then  _.hobby.concur.person.interest
	concur(tag,condition)
	{
		if (typeof condition ==="function"){var rule=condition} //rule defined by function that returns boolean
		else 
		{
			if (condition){var rule = (a,b)=>b.map(item=>item[condition]).includes(a[condition])} 
			else {var rule = (a,b)=>b.map(item=>item.value).includes(a.value)}
		}
		return new class concurPassage extends reify.Passage
		{
			generate()
			{
				super.generate()
				this.results=this.results.filter(item=>rule(item,this.tags[tag].results))
				this.text=this.toString()
				return this.results
			}
		}(this)
	}

	first(count=1)
	{
		return new class firstPassage extends reify.Passage
		{
			generate()
			{
				super.generate()
				var total=this.results.length
				this.results=this.results.slice(0,count)
				var subtotal=this.results.length
				this.results.forEach((result,index)=>
				{
					result.index=index
					result.rank=index+1
					result.subtotal=subtotal
					result.total=total
				})
				this.text=this.toString
				return this.results
			}
		}(this)
	}
	erase(...tags)
	{
		var erasures=tags.flat()
		if (erasures.length===0){erasures=Object.keys(this.tags)}
		erasures.forEach(erasure=>{if (this.tags[erasure]._erasable){this.tags[erasure].passages=[]}})
		return this
	}
	generate(passages=this.passages)
	{
		this.results=[]
		passages.forEach((passage)=>
		{
			if (passage.generate) 
			{
				this.results=this.results.concat(passage.generate())
			}
			else
			{
				if(Object.getPrototypeOf(passage)===Object.prototype)
				{
					if(passage.hasOwnProperty("value"))
					{
						if (passage.value.generate){this.results=this.results.concat(passage.value.generate())}
						else{this.results=this.results.concat(passage)}
					}
					else
					{
						var values=Object.values(passage)
						if (values.length>0)
						{
							if (values[0].generate){this.results=this.results.concat(values[0].generate())}
							else{this.results.push(Object.assign({value:values[0]},passage))}
						}
						else 
						{
							this.results.push({value:""})
						}
					}
				}
				else
				{
					this.results.push({value:passage})
				}
			}
		})
		this.text=this.toString()
		return this.results
	}
	htmlTemplate()
	{
		var template = document.createElement("template")
		template.innerHTML = this.text
		return template
	}
	get inner()
	{
		if (this.passages.length>0 && this.passages[0] instanceof reify.Passage)
		{
			return this.passages[0]
		}
		else
		{
			return this
		}
	}
	join({separator=" ", trim=true}={})
	{
		return new class joinPassage extends reify.Passage
		{
			generate()
			{
				super.generate()
				var last=this.results.length-1
				this.text=this.results.map(item=>item.value).reduce((result,passage,index,)=>result+passage+((index===last && trim)?"":separator),"")	
				if (this.text){this.results=[{value:this.text}]}
				return this.results
			}
		}(this)
	}
	last(count=1)
	{
		return new class lastPassage extends reify.Passage
		{
			generate()
			{
				super.generate()
				var total=this.results.length
				this.results=this.results.slice(-count)
				var subtotal=this.results.length
				this.results.forEach((result,index)=>
				{
					result.index=index
					result.rank=index+1
					result.subtotal=subtotal
					result.total=total
				})
				return this.results
			}
		}(this)
	}
	get match()
	{
		var thisPassage=this
		return new Proxy((precursor) => new class matchPassage extends reify.Passage
		{
			constructor()
			{
				super()
				this.passages[0]=thisPassage  //hobbies
				this.passages[1]=precursor  //person
				this.catalog()
			}
			generate()
			{
				var a=this.passages[0].generate()
				var b= this.passages[1].generate()
				this.results=a.filter(a=>b.map(item=>item.value).includes(a.value))
				this.text=this.toString()
				return this.results
			}
		},reify.template.__handler)
	}
	//Unlike expand, modify takes a function to be applied to each of this passages results.
	modify(modifier,...data)
	{
		if(data.length>0)
		{
			if(data.length===1 && data[0] instanceof reify.Passage){var target=data[0]}
		}
		else {var target=this}
		return new class modifyPassage extends reify.Passage
		{
			constructor()
			{
				if (target){super(target)}
				else{super(...data)}
			}
			generate()
			{
				super.generate()
				this.results=this.results.map(item=>
				{
					var modifiedPassage=Object.assign({},item)
					return Object.assign(modifiedPassage,{value:modifier(item)})
				})	
				this.text=this.toString()
				return this.results
			}
		}()
	}
	slot(rank)
	{
		return new class slotPassage extends reify.Passage
		{
			constructor(primaryPassage)
			{
				super(primaryPassage,rank)
				this.catalog()
			}
			generate()
			{
				super.generate()
				var rank=parseInt(this.passages[1])
				this.results=[Object.assign({index:rank-1 ,rank:rank ,total:this.results[0].length},this.results[rank-1])]
				this.text=this.toString()
				return this.results
			}
		}(this)
	}
	transform(transformer,...data)
	{
		if(data.length>0)
		{
			if(data.length===1 && data[0] instanceof reify.Passage){var target=data[0]}
		}
		else {var target=this}
	
		return new class transformPassage extends reify.Passage
		{
		constructor()
			{
				if (target){super(target)}
				else{super(...data)}
		
			}

			generate()
			{
				this.results=transformer(super.generate().slice(0).map(item=>Object.assign({},item)))
				this.text=this.toString()
				return this.results
			}
		}()
	}
	//_`${_.pick.animal()} `.per.ANIMAL("cat","dog","frog")
	get per()
	{
		var primaryPassage=this
		return new Proxy((...precursor) => new class perPassage extends reify.Passage
		{
			constructor()
			{
				super()
				this.passages[0]=primaryPassage
				if (precursor.length === 1 && precursor[0] instanceof reify.Passage){this.passages[1]=precursor[0]}
				else(this.passages[1]= new reify.Passage(...precursor))
				this.catalog()
				
			}
			generate()
			{
				this.results=[]
				for (let index = 0; index < this.passages[1].generate().length; index++) {
					this.results=this.results.concat(this.passages[0].generate())
				}
				this.text=this.toString()
				return this.results	
			}
		},reify.template.__handler)
	}
	//fill figures out the core passage to fill
	//_fill formats data and assigns to passages array.
	//DEFECT: Do we need to catalog after filling?
	fill(...items)
	{
		if (items.length===1 && Object.getPrototypeOf(items[0])===Object.prototype)  //Might be POJO destined for tagged passages.
		{
			if (!items[0]._tagPassage)
			{
				this.erase()
				Object.keys(items[0]).forEach(key=>
				{
					if (this.tags.hasOwnProperty(key))
					{
						this.tags[key]._erasable=true
						this.tags[key].fill({_tagPassage:true,_data:items[0][key]}) 
					}
				})
				//this.catalog()
				return this	
			}

		}
		if (this.passages.length===1 && this.passages[0] instanceof reify.Passage)  //send items down to the core passage
		{
			this.passages[0].fill(...items)
			//this.catalog()
			return this	

		}
		//We're at the core so update passage array with items.


		if(!(items[0]===undefined) && (Object.getPrototypeOf(items[0])===Object.prototype && items[0]?._tagPassage))
		{
			this._fill(items[0]._data)
		}
		else {this._fill(...items)}
		//this.catalog()
		return this 
	}
	_fill(literals, ...expressions)
	{
		var data=[]
		if (literals !== undefined)
		{
			var index=1
			if( literals.hasOwnProperty("raw"))
			{
				if (expressions.length===0)  //_`blah`
				{
					data=literals
				}
				else //_`blah${}blah` interleave literals into expressions.
				{
					
					if(expressions.length>0)
					{
						var interleaving=expressions.reduce((interleaving,expression)=>
						{
							interleaving.push(expression)
							if (literals[index].length>0)
							{
								interleaving.push(literals[index])
							}
							index++
							return interleaving
						},[])
						
					}
					
					if (literals[0].length !== 0)
					{
						interleaving.unshift(literals[0])
					
					}
					if (index < literals.length)
					{
						interleaving=interleaving.concat(literals.slice(index))
					}
					data=interleaving
				}
			}
			else //function call notation
			{
				if (expressions.length >0 ) // data is simple list of args
				{
					data=[literals].concat(expressions)
				}	
				else  
				{
					if (literals instanceof Array)//_(["blah","blah",_()]) 
					{
						data=literals //avoid wrapping array in array because (a,b,c) is equivalent notation to [a,b,c]
					}
					else //_fill("blah") or _fill(), _fill({properties}) _fill(x=>blah)
					{
						if(literals)
						{	
							data=[literals]
						}
					}
				}
			}
		}				

		if (data.length===0){this.passages=data}
		else
		{
			this.passages=data.map(passage=> //normalize passages
			{
				//if (passage===undefined || passage === null){return ""}
				var passageType=typeof passage
				if(passageType==="string" ||Object.getPrototypeOf(passage)===Object.prototype || passage.generate || passageType==="function" )
				{return passage}

				return passage.toString()

			})
		}	
		return this
	}
	prepend(documentSelector)
	{
		if (documentSelector)
		{
			var targetNodes = document.querySelectorAll(documentSelector)
			targetNodes.forEach(node=>node.prepend(this.htmlTemplate().content))
		}	
		return this
	}
	
	replace(documentSelector)
	{
		if (documentSelector)
		{
			var targetNodes = document.querySelectorAll(documentSelector)
			targetNodes.forEach(node=>
			{
				while(node.firstChild){node.removeChild(node.firstChild)}
				node.append(this.htmlTemplate().content)
			})
		}	
		return this
	}	
	reset()
	{ 
		this.passages.forEach(passage=>
		{
			if(passage instanceof reify.Passage){passage.reset()}	
		})
		return this
	}
	get results(){return this._results}
	set results(value){this._results=value}
	say(seed) 
	{
		if (seed>=0){this.seed(seed)}
		this.generate()
		return this
	}
	seed(seed) 
	{
		if (seed>=0 && seed <1){this._seed=Math.floor(seed* 2147483648)}
		else
		{
			if(!seed){this._seed=reify.util.random().seed}
			else{this._seed=seed}
		}
		this.passages.forEach(passage=>
		{
			if(passage instanceof reify.Passage)
			{
				passage.seed(reify.util.random(this._seed).seed)
			}	
		})
		return this
	}
	tag(id)
	{
		this.id=id
		this.catalog()
		return this
	}
	/*lock(id) //not used anywhere
	{
		this._locked=true
		return this
	}*/
	get then()
	{
		var primaryPassage=this
		return new Proxy((...precursor) => new class thenPassage extends reify.Passage
		{
			constructor()
			{
				super()
				this.passages[0]=primaryPassage
				this.passages[1]=new reify.Passage(...precursor)
				this.catalog()
			}
			generate()
			{
				var results=this.passages[0].generate()
				if (results.length>1 || (results.length===1 && results[0].value!==""))
				{
					this.results=results
					this.text=this.passages[0].text
				}
				else
				{
					this.results=this.passages[1].generate()
					this.text=this.passages[1].text
				}
				return this.results
			}
		},reify.template.__handler)
	}
	

	//Unlike modify, expand takes a passage factory and applies the results of this passage to it.
	expand(passageFactory)
	{
		var thisPassage=this
		return new class expandPassage extends reify.Passage
		{
			generate()
			{
				this.results=thisPassage.generate()
				this.text=this.toString()
				if (this.text)
				{
					if(this.results.length===1 && this.results[0].value instanceof Array)
					{
						this.results=passageFactory(this.results[0].value).generate().map(item=>Object.assign({},item))	
					}
					else
					{
						this.results=passageFactory(this.results).generate().map(item=>Object.assign({},item))
					}
					this.text=this.toString()
				}
				else 
				{
					this.results=[]
					this.text=""
				}
				return this.results
			}
		}(this)
	}
	toString()
	{
		return this.results.map(result=>
		{	
			if (result===undefined){return ""}
			if (Object.getPrototypeOf(result)===Object.prototype)
			{
				if ( result.hasOwnProperty("value"))
				{
					return result.value.toString()
				}
				var value =Object.values(result)[0]
				if (value===undefined){return ""}
				return value.toString()
			}
		}).join("")	
	}
	
}
reify.Passage.define=function(id)
{
	var as= (passageFactory)=>
	{
		Object.defineProperty(reify.Passage.prototype,id,
		{
			get()
			{
				return passageFactory(this)
			}
		})
	}
	return {as:as}	
}
reify.Passage.__handler=
{
	get: function(target, property, receiver) 
	{
		if (Reflect.has(target,property,receiver)) 
		{
			return Reflect.get(target,property,receiver)
		}
		else 
		{
		//	if (property.toUpperCase()===property) 
            if (property.startsWith("$")) 
			{
				//return new reify.Passage(target).tag(property.toLowerCase())
                return new reify.Passage(target).tag(property.slice(1))
			}
			else
			{
				if(target.constructor.name==="siblingPassage"){return reify.template.child(target,property)}
				else{return reify.template.sibling(target,property)}
			}
		}
	}	
}

// #endregion
// #region Template
reify.template={}
reify.template.__handler=
{
	 //_.a.b.c() becomes _.a(b(c()))
	 //_.a.b.c.TAG() becomes _.a(b(c())) c() is tagged
	 //_.a.TAG.b.c() becomes _.a(b(c())) b(c()) is tagged
	 //_.a.b.tag becomes _.a(b(echo(tag)))
	 //_.a.b.tag.data1 becomes _.a(b(data1(echo(tag)))))
	 //_.a.b.tag.data1.data2 becomes _.a(b(data2(data1(echo(tag)))))
	 //_.a.tags.b becomes 
	 //_.a.cap.pick("cat","dog","frog")
	 //t=>_.a.cap(t.term.description.z)

	//if template[asFunction] is undefined, property refers to a tagged passage.
	get:function(template, property,receiver)
	{
		//template is function that returns a passage
		if (property==="asFunction")
		{
			return template	 
		}
		//_.a.b.c() becomes _.a(b(c()))
		if (reify.template.hasOwnProperty(property)) //property is a template
		{
			return new Proxy
			(
				function(...precursor)
				{
					return template(reify.template[property].asFunction(...precursor))
				},		
				reify.template.__handler
			)
		}
		//_.a.b.c.$tagName() becomes _.a(b(c())) c() is tagged
	 	//_.a.$tagName.b.c() becomes _.a(b(c())) b(c()) is tagged
		//if (property.toUpperCase()===property)  //property is request to create a tagged passage
        if (property.startsWith("$"))  //property is request to create a tagged passage
		{
			//var finalPassageFactory=(...precursor)=>template(new reify.Passage(...precursor).tag(property.toLowerCase()))
			//var priorPassageFactory=(...precursor)=> new reify.Passage(...precursor).tag(property.toLowerCase())
            var finalPassageFactory=(...precursor)=>template(new reify.Passage(...precursor).tag(property.slice(1)))
			var priorPassageFactory=(...precursor)=> new reify.Passage(...precursor).tag(property.slice(1))
			var handler=Object.assign(
				{
					wrapper:template,
					prior:priorPassageFactory,
					sibling:true //next property request for sibling
				},
				reify.template.__handler	
			)
			return new Proxy(finalPassageFactory,handler)
		}
		if (this.sibling)  //property is request for sibling passage
		{
			var finalPassageFactory=()=>this.wrapper(reify.template.sibling(this.prior(),property))
			var priorPassageFactory=()=>reify.template.sibling(this.prior(),property)
			var handler=Object.assign(
				{
					wrapper:this.wrapper,
					prior:priorPassageFactory,
					child:true  //next property request is for child
				},
				reify.template.__handler	
			)
			return new Proxy(finalPassageFactory,handler)			

		}
		if (this.child)
		{
			var finalPassageFactory=()=>this.wrapper(reify.template.child(this.prior(),property))
			var priorPassageFactory=()=>reify.template.child(this.prior(),property)
			var handler=Object.assign(
				{
					wrapper:this.wrapper,
					prior:priorPassageFactory,
					child:true  //all future property request are for children
				},
				reify.template.__handler	
			)
			return new Proxy(finalPassageFactory,handler)	
		}
		//property is neither request for child nor sibling; must be echo passage
		var finalPassageFactory=()=>template(reify.template.echo(property))
		var priorPassageFactory=()=>reify.template.echo(property)
		var handler=Object.assign(
			{
				wrapper:template,
				prior:priorPassageFactory,
				sibling:true //next property request for sibling
			},
			reify.template.__handler	
		)
		return new Proxy(finalPassageFactory,handler)
	}
}

reify.template.defineClass=function(id)
{
	var as= (passageClass)=>
	{
		reify.template[id]=new Proxy((...precursor)=>new passageClass(...precursor),reify.template.__handler)
	}
	return {as:as}	
}
reify.template.define=function(id)
{
	var as= (passageFactory)=>
	{
		reify.template[id]=new Proxy(passageFactory,reify.template.__handler)
	}
	return {as:as}	
}
reify.template._=new Proxy
(
	function _(...data)
	{
		if (data.length===1 && data[0] instanceof reify.Passage) return data[0]
		else return new reify.Passage(...data)
	}
	,reify.template.__handler
)
reify.template.define("cycle").as((...data)=>
{
	var counter=0
	return new class cyclePassage extends reify.Passage
	{
		fill(literals, ...expressions)
		{
			super.fill(literals, ...expressions)
			counter=0
			return this
		}
		generate()
		{
			var results=[]	
			if (this.passages.length===1 && this.passages[0] instanceof reify.Passage)
			{
				results=super.generate()
				var total=this.results.length
				results=results.slice(counter,counter+1)
			}
			else
			{
				var results=super.generate(this.passages.slice(counter,counter+1))
				var total=this.passages.length
			}
			if (this.results.length===0)
			{
				this.results=[{value:"",index:0, rank:0, total:0,  reset:true}]
				this.text=""
				var total=0
			}
			else
			{
				Object.assign(results[0],{index:counter, rank:counter+1,total:total, reset:counter===total-1})
				this.results=results
				this.text=results[0].value
			}	
			counter++
			if (counter===total || total===0)
			{
				counter=0
				this.reset()
			}
			return this.results
		}
	}(...data)
})
reify.template.echo=function echo(tag)
{
	return new class echoPassage extends reify.Passage
	{
		constructor()
		{
			super()
			if (tag instanceof reify.Passage){this.passages[0]=tag}
			this.echo=true
		}
		generate()
		{
			if (this.passages.length===0){this.passages[0]=this.tags[tag]}

			if (this.echo){this.results=this.passages[0].results}
			else{this.results=this.passages[0].generate()}
			this.text=this.toString()
		//	this.tally=this.passages[0].value.tally
			return this.results
		}
		get inner()
		{
			if (this.passages.length===0){var innerPassage= echo(this.tags[tag].inner)}
			else {var innerPassage= echo(this.passages[0].inner)}
			innerPassage.echo=this.echo
			return innerPassage
		}
		get results()
		{
			if (this.passages.length===0){tag.results}
			else {return super.results}
		}
		set results(value){this._results=value}
	}()		
}
//_.blah.echo.data.data
//_blah.data.data

reify.template.sibling=function sibling(passage, property)
{
	return new class siblingPassage extends reify.Passage
	{
		constructor()
		{
			super()
			this.passages[0]=passage
		}
		generate()
		{
			this.results=this.passages[0].generate()
			if (this.results.length===1 && this.results[0][property].generate)
			{
				this.results= this.results[0][property].generate()
			}
			else
			{	
				this.results=this.results.map(result=>({value:result[property]}))
			}	

			this.text=this.toString()
			return this.results
		}
	}()		
}
reify.template.define("child").as(function child(parent,property)
{
	return new class childPassage extends reify.Passage
	{
		constructor()
		{
			super()
			this.passages[0]=parent
		}
		generate()
		{
			this.results=this.passages[0].generate()
			if (this.results.length===1 && this.result[0].value[property].generate)
			{
				this.results= this.results[0].value[property].generate()
			}
			else
			{	
				this.results=this.results.map(result=>({value:result.value[property]}))
			}
			this.text=this.toString()
			return this.results
		}
	}()		
})
reify.template.define("ante").as(function ante(outer)
{
	return new class antePassage extends reify.Passage
	{
		constructor()
		{
			super(outer)
		}
		generate()
		{
			var target=this.inner
			this.results=target.generate()
			this.text=target.text
			return this.results
		}

		get inner()
		{
			var counter=0
			var target=this
			while (target.constructor.name === "antePassage")
			{
				counter++
				target=target.passages[0] 
			}
			for (let i = 0; i <counter; i++)
			{
				target=target.inner
			}	
			return target
		}
	}()		
})

reify.template.defineClass("favor").as( class favorPassage extends reify.Passage
{
	generate()
	{
		if(this.passages.length===0)
		{
			this.text=""
			this.results=[]
			//this.tally++
			return this.results
		}
		else
		{
			var {value:random,seed}=reify.util.random(this._seed)
			this._seed=seed
			
			if (this.passages.length===1 && this.passages[0] instanceof reify.Passage)
			{
				var results=super.generate()
				var total=results.length
				var c=total*(total+1)*random
				var counter=total-Math.floor((Math.sqrt(1+4*c)-1)/2)-1
				results=results.slice(counter,counter+1)
			}
			else
			{
				var total=this.passages.length
				var c=total*(total+1)*random
				var counter=total-Math.floor((Math.sqrt(1+4*c)-1)/2)-1
				var results=super.generate(this.passages.slice(counter,counter+1))
			}

			results.forEach(passage=>
			{
				passage.index=counter
				passage.rank=counter+1
				passage.total=total
			})
			this.results=results
			return this.results
		}
	}
	
})
reify.template.define("pick").as((...data)=>
{
	var previous
	return new class pickPassage extends reify.Passage
	{
		generate()
		{
			if(this.passages.length===0)
			{
				this.text=""
				this.results=[]
				//this.tally++
				return this.results
			}
			else
			{
				var {value:random,seed}=reify.util.random(this._seed)
				this._seed=seed
				if (this.passages.length===1 && this.passages[0] instanceof reify.Passage)
				{
					var results=super.generate()
					var total=results.length
					var counter=Math.floor(random*total)
					if (counter===previous){counter =(counter+1)%total}
					previous=counter
					results=results.slice(counter,counter+1)
				}
				else
				{
					var total=this.passages.length
					var counter=Math.floor(random*total)
					if (counter===previous){counter =(counter+1)%total}
					previous=counter
					var results=super.generate(this.passages.slice(counter,counter+1))
				}

				results.forEach(passage=>
				{
					passage.index=counter
					passage.rank=counter+1
					passage.total=total
				})
				this.results=results
				return this.results
			}
		}
	}(...data)
})
reify.template.define("re").as((passage)=>
{
	passage.re=true
	return passage
})

reify.template.define("cull").as((...precursor)=>
{
	return new class cullPassage extends reify.Passage
	{
		generate()
		{
			super.generate()
			this.results=this.results.reduce((results,item)=>
			{
				if (item.value){ results.push(item)}
				return results
			},[])
			return this.results
		}
	}(...precursor)
})
reify.template.define("refresh").as((...precursor)=>
{
	return new class refreshPassage extends reify.Passage
	{
		generate()
		{
			this.reset()
			super.generate()
			return this.results
		}
	}(...precursor)
})
reify.template.defineClass("roll").as( class rollPassage extends reify.Passage
{
	generate()
	{
		if(this.passages.length===0)
		{
			this.text=""
			this.results=[]
			//this.tally++
			return this.results
		}
		else
		{
			var {value:random,seed}=reify.util.random(this._seed)
			this._seed=seed
			if (this.passages.length===1 && this.passages[0] instanceof reify.Passage)
			{
				var results=super.generate()
				var total=results.length
				var counter=Math.floor(random*total)
				results=results.slice(counter,counter+1)
			}
			else
			{
				var total=this.passages.length
				var counter=Math.floor(random*total)
				var results=super.generate(this.passages.slice(counter,counter+1))
			}

			results.forEach(passage=>
			{
				passage.index=counter
				passage.rank=counter+1
				passage.total=total
			})
			this.results=results
			return this.results
		}
	}
})
reify.template.define("series").as((...data)=>
{
	var counter=0
	return new class seriesPassage extends reify.Passage
	{
		fill(literals, ...expressions)
		{
			super.fill(literals, ...expressions)
			this.ended=false
			counter=0
			return this
		}
		generate()
		{
			var results=[]	
			if (this.passages.length===1 && this.passages[0] instanceof reify.Passage)
			{
				var results=super.generate()
				var total=results.length
				results=results.slice(counter,counter+1)
			}
			else
			{
				var results=super.generate(this.passages.slice(counter,counter+1))
				var total=this.passages.length
			}
			if (this.ended || this.results.length===0 )
			{
				this.results=[{value:"",index:0, rank:0, total:0,  reset:true}]
				this.text=""
				var total=0
			}
			else
			{
				Object.assign(results[0],{index:counter, rank:counter+1,total:total})
				this.results=results
				this.text=results[0].value.toString()
			}

			counter++
			if (counter===total)
			{
				this.ended=true
				counter=0
			}
			return this.results
		}
		reset()
		{
			super.reset()
			this.ended=false
			counter=0
			return this
		}
	}(...data)
})
reify.template.define("shuffle").as((...data)=>
{
	var reshuffle =true
	return new class shufflePassage extends reify.Passage
	{
		generate()
		{
			if (reshuffle)
			{
				super.generate()
				var {value:random,seed}=reify.util.random(this._seed)
				this._seed=seed
				this.results=reify.util.shuffle(this.results,random).result
				reshuffle=false
			}
			this.text=this.toString()
			return this.results
		}
		
		fill(literals, ...expressions)
		{
			super.fill(literals, ...expressions)
			reshuffle=true
		}
		reset()
		{
			super.reset()
			reshuffle=true
			return this
		}
		
	}(...data)
})

reify.template.define("pin").as((...data)=>
{
	var pin =true
	return new class pinPassage extends reify.Passage
	{
		fill(literals, ...expressions)
		{
			super.fill(literals, ...expressions)
			pin =true
			return this
		}
		generate()
		{
			if (pin)
			{
				super.generate()
				pin=false
			}
			
			return this.results
		}
		reset()
		{
			if(pin)
			{
				super.reset()
			}
		}
	}(...data)
})
reify.template.define("spc").as((...precursor)=>
{
	return new class spacePassage extends reify.Passage
	{
		generate()
		{
			super.generate()
			
			this.text=this.toString()
			
			if (this.text!==""){var space=" "}
			else{var space=""}
			this.results.unshift({value:space})
			this.text=space+this.text
			
			return this.results
		}
	}(...precursor)
})

reify.template.define("next").as(function next(precursor)
{
	precursor.echo=false
	return precursor
})

// #region Templates Prefixes and passage suffixes/infixes

reify.template.define("a").as((...data)=> reify.Passage.prototype.modify(item=>`${reify.lang.a(item.value)} ${item.value}`,...data))
reify.template.define("A").as((...data)=>reify.Passage.prototype.modify(item=>`${reify.lang.capitalize(reify.lang.a(item.value))} ${item.value}`,...data))
reify.template.an=reify.template.a
reify.template.An=reify.template.a

reify.template.define("cap").as((...data)=> reify.Passage.prototype.modify(item=>reify.lang.capitalize(item.value),...data))

/*** Passages suffixes***/
reify.Passage.define("ed").as( precursor => precursor.modify(item=>reify.lang.ed(item.value)))
reify.Passage.define("en").as( precursor => precursor.modify(item=>reify.lang.en(item.value)))
reify.Passage.define("er").as (precursor => 
{
	return precursor.modify(item=>
	{
		if(item.degree)
		{
			if (item.degree===reify.degree.positive){return item}
			if (item.degree===reify.degree.comparative){return reify.lang.er(item.value)}
			if (item.degree===reify.degree.superlative){return reify.lang.est(item.value)}
		}
		else {return reify.lang.er(item.value)}
	})
})
reify.Passage.define("es").as( precursor => precursor.modify(item=>reify.lang.es(item.value)))
/*reify.Passage.prototype.es= function(subject)
{	
	return this.modify(item=>
	{
		if (subject)
		{
			if(subject.length>1){return item.value}
			if(subject.length===1)
			{
				var lowerCaseSubject=subject[0].value.toLowerCase()
				if (lowerCaseSubject==="i" || lowerCaseSubject==="you" ||lowerCaseSubject==="we" ||lowerCaseSubject==="they" ){return item.value}
			} 
		}
		return reify.lang.es(item.value)
	})
}*/
reify.Passage.define("est").as (precursor => 
{
	return precursor.modify(item=>
	{
		if(item.degree)
		{
			if (item.degree===reify.lang.degree.positive){return item}
			if (item.degree===reify.lang.degree.comparative){return reify.lang.er(item.value)}
			if (item.degree===reify.lang.degree.superlative){return reify.lang.est(item.value)}
		}
		else {return reify.lang.est(item.value)}
	})
})
reify.Passage.define("ing").as( precursor => precursor.modify(item=>reify.lang.ing(item.value)))


reify.template.define("list").as((...data)=>
{
	return reify.template._`${reify.template._.ITEM.cycle.items()}${reify.template._.item().modify(t=>t.rank < t.total && t.total>2?", ":"")}${reify.template._.item().modify(t=>t.rank===1 && t.total===2?" and ":"")}${reify.template._.item().modify(t=>t.index===t.total-2 && t.total>2?"and ":"")}`.per.ITEMS.cull(...data)
})
reify.Passage.define("s").as (precursor => 
{
	return precursor.modify(item=>
	{
		if (item.number===reify.lang.number.singular){return item.value}
		return reify.lang.s(item.value)
	})
})
reify.template.define("a").as((...data)=> reify.Passage.prototype.modify(item=>`${reify.lang.a(item.value)} ${item.value}`,...data))
reify.Passage.define("z").as(precursor =>precursor.modify(item=>reify.lang.z(item.value)))

// #region inflected text
// #region articles
reify.template.define("some").as((...data)=>
{
	return reify.Passage.prototype.transform(results=>
	{
		var some=[]
		var a=[]
		var proper=[]
		results.forEach(item=>
		{
			if (item.proper){proper.push(item)}
			else
			{
				if(item.number===reify.lang.number.plural || item.quantity>1 ||item.ply_quantity>1){some.push(item)}
				else {a.push(item)}
			}
		})
		return reify.template.list(reify.template.list(proper), reify.template._`some `.when.list(some), reify.template.a.list(a)).generate()
	},...data)	
})

reify.template.define("Some").as((...data)=>
{
	return reify.template.cap(reify.template.some(...data))	
})

reify.template.define("the").as((...data)=>
{
	return reify.Passage.prototype.transform(results=>
	{
		var the=[]
		var proper=[]
		results.forEach(item=>
		{
			if (item.proper){proper.push(item)}
			else {the.push(item)}
		})
		return reify.template.list(_.list(proper), reify.template._`the `.when.list(the)).generate()
	},...data)	
})
reify.template.define("The").as((...data)=>
{
	return reify.template.cap(reify.template.the(...data))	
})
// #endregion
// #region pronouns
//I,we,you,he, she, it, they
reify.template.define("I").as((...data)=>
{
	return reify.Passage.prototype.transform(results=>
	{
		if (results.length>1 || results[0].number ===reify.lang.number.plural || results.quantity>1 ||results.ply_quantity>1)
		{
			return [{value:reify.lang.pronouns.plural.subjective[results[0].person ?? reify.lang.person.first]}]
			[{value:reify.lang.pronouns[results[0].gender ?? "epicene"].subjective[results[0].person ?? reify.lang.person.first]}]
		} 
		else {return [{value:reify.lang.pronouns[results[0].gender ?? "epicene"].subjective[results[0].person ?? reify.lang.person.first]}]}
	},...data)	
})
reify.template.define("we").as((...data)=>
{
	return reify.Passage.prototype.transform(results=>
	{
		if (results.length===1 || results[0].number ===reify.lang.number.singular || results.quantity===1 ||results.ply_quantity===1)
		{
			return [{value:reify.lang.pronouns[results[0].gender ?? "epicene"].subjective[results[0].person ?? reify.lang.person.first]}]
		} 
		else {return [{value:reify.lang.pronouns.plural.subjective[results[0].person ?? reify.lang.person.first]}]}
	},...data)	
})
reify.template.define("We").as((...data)=>
{
	return reify.template.cap(reify.template.we(...data))	
})
reify.template.define("you").as((...data)=>
{
	return reify.Passage.prototype.transform(results=>
	{
		return [{value:reify.lang.pronouns[results[0].gender ?? "epicene"].subjective[results[0].person ?? reify.lang.person.second]}]
	},...data)	
})
reify.template.define("You").as((...data)=>
{
	return reify.template.cap(reify.template.you(...data))	
})
reify.template.define("he").as((...data)=>
{
	return reify.Passage.prototype.transform(results=>
	{
		if (results.length>1 || results[0].number ===reify.lang.number.plural || results.quantity>1 ||results.ply_quantity>1)
		{
			return [{value:reify.lang.pronouns.plural.subjective[results[0].person ?? reify.lang.person.third]}]
		} 
		else {return [{value:reify.lang.pronouns[results[0].gender ?? "male"].subjective[results[0].person ?? reify.lang.person.third]}]}
	},...data)	
})
reify.template.define("He").as((...data)=>
{
	return reify.template.cap(reify.template.he(...data))	
})
reify.template.define("she").as((...data)=>
{
	return reify.Passage.prototype.transform(results=>
	{
		if (results.length>1 || results[0].number ===reify.lang.number.plural || results.quantity>1 ||results.ply_quantity>1)
		{
			return [{value:reify.lang.pronouns.plural.subjective[results[0].person ?? reify.lang.person.third]}]
		} 
		else {return [{value:reify.lang.pronouns[results[0].gender ?? "female"].subjective[results[0].person ?? reify.lang.person.third]}]}
	},...data)	
})
reify.template.define("She").as((...data)=>
{
	return reify.template.cap(reify.template.She(...data))	
})
reify.template.define("it").as((...data)=>
{
	return reify.Passage.prototype.transform(results=>
	{
		if (results.length>1 || results[0].number ===reify.lang.number.plural || results.quantity>1 ||results.ply_quantity>1)
		{
			return [{value:reify.lang.pronouns.plural.subjective[results[0].person ?? reify.lang.person.third]}]
		} 
		else {return [{value:reify.lang.pronouns[results[0].gender ?? "neuter"].subjective[results[0].person ?? reify.lang.person.third]}]}
	},...data)	
})
reify.template.define("It").as((...data)=>
{
	return reify.template.cap(reify.template.it(...data))	
})
reify.template.define("they").as((...data)=>
{
	return reify.Passage.prototype.transform(results=>
	{
		if (results.length===1 && results[0].number !==reify.lang.number.plural && !(results.quantity>1) && !(results.ply_quantity>1))
		{
			return [{value:reify.lang.pronouns[results[0].gender ?? "epicene"].subjective[results[0].person ?? reify.lang.person.third]}]
		} 
		else {return [{value:reify.lang.pronouns.plural.subjective[results[0].person ?? reify.lang.person.third]}]}
	},...data)	

})
reify.template.define("They").as((...data)=>
{
	return reify.template.cap(reify.template.they(...data))	
})

//me,us,him, her, them
reify.template.define("me").as((...data)=>
{
	return reify.Passage.prototype.transform(results=>
	{
		if (results.length>1  || results[0].number ===reify.lang.number.plural || results.quantity>1 ||results.ply_quantity>1)
		{
			return [{value:reify.lang.pronouns.plural.objective[results[0].person ?? reify.lang.person.first]}]
		} 
		else {return [{value:reify.lang.pronouns[results[0].gender ?? "epicene"].objective[results[0].person ?? reify.lang.person.first]}]}
	},...data)
})
reify.template.define("us").as((...data)=>
{
	return reify.Passage.prototype.transform(results=>
	{
		if (results.length===1  || results[0].number ===reify.lang.number.singular || results.quantity===1 ||results.ply_quantity===1)
		{
			return [{value:reify.lang.pronouns[results[0].gender ?? "epicene"].objective[results[0].person ?? reify.lang.person.first]}]
		} 
		else {return [{value:reify.lang.pronouns.plural.objective[results[0].person ?? reify.lang.person.first]}]}
	},...data)
})
reify.template.define("them").as((...data)=>
{
	return reify.Passage.prototype.transform(results=>
	{
		if (results.length>1  || results[0].number ===reify.lang.number.plural || results.quantity>1 ||results.ply_quantity>1)
		{
			return [{value:reify.lang.pronouns.plural.objective[results[0].person ?? reify.lang.person.third]}]
		} 
		else {return [{value:reify.lang.pronouns[results[0].gender].objective[results[0].person ?? reify.lang.person.third]}]}
		
	},...data)
})
reify.template.define("Them").as((...data)=>
{
	return reify.template.cap(reify.template.them(...data))	
})
