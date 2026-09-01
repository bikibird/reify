reify={}
// #region Passage

reify.Passage =class Passage
{
	constructor(...items) 
	{
		Object.defineProperty(this,"id",{value:"",writable:true})
        Object.defineProperty(this,"scene",{value:null,writable:true})
        Object.defineProperty(this,"mise",{value:false,writable:true})
		Object.defineProperty(this,"prefix",{value:[],writable:true})
		Object.defineProperty(this,"passages",{value:[],writable:true})
		Object.defineProperty(this,"results",{value:[],writable:true})
		//Object.defineProperty(this,"_seed",{value:reify.util.random().seed,writable:true})
        Object.defineProperty(this,"suffix",{value:[],writable:true})
		Object.defineProperty(this,"text",{value:"",writable:true})
		this.fill(...items)

		return this
	}
	
	append(documentSelector)
	{
		if (documentSelector)
		{
			var targetNodes = document.querySelectorAll(documentSelector)
			targetNodes.forEach(node=>node.append(this.htmlStoryline().content))
		}	
		return this
	}
	//console.log(_.scene`hello, ${_.something.name()}. `)
	generate(row)
	{
        let loop=1,results=[]
        if (mise) loop=this.scene.mise.length
        for(let i=0;i<loop;i++)
        {
            if (mise) row=this.scene.mise[i].entity
            if (this.entity)
            {
                if (this.attribute) results.push(row[this.entity][this.attribute])
                else results.push(row[this.entity].name)
            }
            else
            {
                passages.forEach((passage)=>
                {
                    if (passage.generate) 
                    {
                        this.results=this.results.concat(passage.generate(row))
                    }
                    else 
                    {
                        this.results.push((passage).toString())
                    }
                })
            }
            this.prefix.forEach(prefix=>
            {
                this.results= prefix(this.results,row)
            })

            this.suffix.forEach(suffix=>
            {
                this.results = suffix(results)
            })
        }
        
		this.text=this.results.toString()
		return this.results
	}
	
	//fill figures out the core passage to fill
	//_fill formats data and assigns to passages array.
    fill(literals, ...expressions)
	{
		var data=[]
		if (literals !== undefined)
		{
			var index=1
			if( literals.hasOwnProperty("raw")) //template literal passed in 
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
			targetNodes.forEach(node=>node.prepend(this.htmlStoryline().content))
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
				node.append(this.htmlStoryline().content)
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
		//if (seed>=0){this.seed(seed)}
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


// #endregion
// #region Storyline



reify.prefixProxy=
{
	get: function(target, property,receiver) 
	{
        if (target.erstatz) //another prefix to process
        {
            if (property="scene") target.mise=true
            else if (reify.prefix[property]) target.prefix.unshift(reify.prefix[property])
            else if (!target.entity)target.entity=property
            else target.attribute=property
            return receiver
        }
       
        else //first prefix
        {

            const erstatzPassage =function(){}
            erstatzPassage.erstatz=true
            if (property="scene") erstatzPassage.mise=true
            else if (reify.prefix[property]) erstatzPassage.prefix=[reify.prefix[property]]
            else if (!erstatzPassage.entity)erstatzPassage.entity=property
            else erstatzPassage.attribute=property
            return new Proxy(erstatzPassage,reify.prefixProxy)
        }
	
	},
    apply: function(target, thisArg, args)
    {
        const passage=new reify.Passage(args)    
        passage.prefix=target.prefix ?? []
        passage.mise=target.mise
        return new Proxy(passage,reify.suffixProxy)
    }
}
reify.suffixProxy=
{
	get: function(target, property,receiver) 
	{
        if (reify.suffix.hasOwnProperty(property))
        {
            target.suffix.push(reify.suffix[property])
            return receiver //might be another suffix next
        }
        else 
        {
            return target[property]
        }
	},
}
reify._=new Proxy((function(){}),reify.prefixProxy)

reify.prefix=
{
    a:function(passages)
    {   
        const results=[]
        passages.forEach(passage=>
        {
            results.push("a "+passage.toString())
        })
        return results
    }
    ,
    b:function(passages)
   {   
        const results=[]
        passages.forEach(passage=>
        {
            results.push("b "+passage.toString())
        })
        return results
    },
    c:function(passages)
    {
        const results=[]
        passages.forEach(passage=>
        {
            results.push("c "+passage.toString())
        })
        return results
    }
}
reify.suffix=
{
    d:function(passages)
    {   
        const results=[]
        passages.forEach(passage=>
        {
            results.push(passage.toString()+" d")
        })
        return results
    }
    ,
    e:function(passages)
   {   
        const results=[]
        passages.forEach(passage=>
        {
            results.push(passage.toString()+" e")
        })
        return results
    },
    f:function(passages)
    {
        const results=[]
        passages.forEach(passage=>
        {
            results.push(passage.toString()+" f")
        })
        return results
    }
}