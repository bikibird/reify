"use strict"
/*
ISC License

Copyright 2019-2026, Jennifer L Schmidt

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

https://whitewhalestories.com

@bikibird
*/

const reify = {}
// #region utility functions
reify.util={_seed:undefined}

reify.util.enumerator=function* (aStart =1)
{
  let i = aStart;
  while (true) yield i++
}
reify.cartesianProduct=function (a, b)
{
	if (a.length===0) return b
	let r= a.reduce((acc, x) => [...acc, ...b.map(y => [x, y])], [])
	return r

}

reify.formatId=function(literals, ...expressions)
{

	if(literals)
	{ 
        return reify.toString(literals,...expressions).trim().toLowerCase().replace(/\s+/g, '_')
	}	
	else 
	{
		throw new Error("ERROR 0003: Unable to format id.")
	}
}
reify.formatName=function(literals, ...expressions)
{
	if(literals)
	{ 
		return reify.toString(literals, ...expressions).trim().replace("_"," ")
	}	
	else 
	{
		throw new Error("ERROR 0004: Unable to format name .")
	}
}
reify.toString=(literals, ...expressions) => 
{
	if (literals.raw) return String.raw({ raw:literals }, ...expressions) //identity transform for template literals
	else return literals.toString() 	
}
reify.util.autoId=reify.util.enumerator()
reify.util.random = function(seed=Math.floor(Math.random() * 2147483648)) 
{
	return {value:(seed* 16807 % 2147483647-1)/2147483646,seed:seed * 16807 % 2147483647}

}
/*reify.util.reseed = function(seed=Math.floor(Math.random() * 2147483648)) 
{
	reify.util._seed=seed	
}*/
reify.util.shuffle=function(anArray,{length=null,seed=Math.floor(Math.random() * 2147483648)}={})
{
	var array=anArray.slice(0)
	var m = array.length
	var count=length||array.length
	for (let i=0; i < count; i++)
	{
		var {value,seed}=this.random(seed)
		let randomIndex = Math.floor(value * m--)
		let item = array[m]
		array[m] = array[randomIndex]
		array[randomIndex] = item
	}
	return {result:array.slice(-count),seed:seed}
}
// #endregion
// #region enumerations

// #endregion
// #region regex
reify.regex=reify.regex||{}
reify.regex.floatingPointNumber=/^-?([0-9]*[.])?[0-9]+/
reify.regex.whitespace=/^\s+/
reify.regex.word=/^\w*/

// #endregion
// #region Factories and Classes
// #region Interpretation 
reify.Interpretation=function Interpretation(gist={},remainder="",valid=true,lexeme)
{
	
	if (this instanceof reify.Interpretation)
	{
		this.lexeme=lexeme??""
		if (gist instanceof Array)
		{
			this.gist=gist.map(g=>
			{
				if (g instanceof reify.Token)
				{
					return g.clone()
					//this.gist.lexeme=this.lexeme
					//g.lexeme=this.lexeme
					//return g
				}	
				else
				{
					return Object.assign({},g)
					
				}	

			})
		}
		else
		{
			if(gist instanceof reify.Token)
			{
				this.gist=gist.clone()
				//this.gist.lexeme=this.lexeme
			}
			else
			{
				this.gist=Object.assign({},gist)
				this.gist.lexeme=this.lexeme
			}	
		}
		

		this.remainder=remainder.slice()
		this.valid=valid
		return this
	}
	else
	{
		return new Interpretation(gist,remainder)
	}
}

// #endregion
// #region Lexicon
reify.Lexicon=function Lexicon() 
{
	if (this instanceof reify.Lexicon)
	{

		Object.defineProperty(this, "trie", {value:{},writable: true})
		return this
	}
	else
	{
		return new Lexicon()
	}
}

reify.Lexicon.prototype.register = function (...someLexemes) 
{
	var lexemes=someLexemes
	var _as =function(definition)
	{
		lexemes.forEach((lexeme)=>
		{
			var _trie = this.trie
			for (let i = 0, length =lexeme.length; i < length; i++)
			{
				var character = lexeme.charAt(i)
				_trie = (_trie[character] =_trie[character] || {})
			}
			if (!_trie.definitions)
			{
				_trie.definitions= []
			}
			_trie.definitions.push(definition)
		})	
		return this
	}	
	return {as:_as.bind(this)}	
}
reify.Lexicon.prototype.register = function (...someLexemes) 
{
	var lexemes=someLexemes
	var _as =function(...definitions)
	{
		lexemes.forEach((lexeme)=>
		{
			var _trie = this.trie
			for (let i = 0, length =lexeme.length; i < length; i++)
			{
				var character = lexeme.charAt(i)
				_trie = (_trie[character] =_trie[character] || {})
			}
			if (!_trie.definitions)
			{
				_trie.definitions= []
			}
			_trie.definitions=_trie.definitions.concat(definitions)
		})	
		return this
	}	
	return {as:_as.bind(this)}	
}

reify.Lexicon.prototype.search = function (searchText, {regex=false,separator=/^\s+/, boundary,caseSensitive=false, full=false, longest=false, lax=false}={}) 
{
	var _trie = this.trie
	var _results = []
	if(regex)
	{
		var match=searchText.match(regex)
		if (match)
		{
			var result={}
			result.token=new reify.Token(match[0],{fuzzy:true, match:match[0]})
			result.remainder=searchText.slice(match[0].length)
			if (separator && result.remainder.length>0)
			{
				var discard=result.remainder.match(separator)
				if (discard !== null)
				{
					if (discard[0] !==""){result.remainder=result.remainder.slice(discard[0].length)}
					_results.unshift(result)
				}
				else 
				{ 
					if (lax)
					{
						_results.unshift(result)
					}
				}
			}
			else
			{
				_results.unshift(result)
			}
			
		}
		return _results
	}
	else
	{
		for (let i=0; i < searchText.length; i++)
		{
			if (caseSensitive){var character=searchText.charAt(i)}
			else{var character=searchText.charAt(i).toLowerCase()}
			if ( ! (_trie[character] ))
			{	
				if(longest || full)
				{
					_results= _results.slice(0,1)
					if(full && _results[0].remainder.length>0 ){_results=[]}
					else { return _results}
				}
				else
				{
					return _results
				}
			}
			else
			{	
				if(_trie[character].definitions)
				{
					_trie[character].definitions.forEach(definition=>
					{
						if (i<searchText.length-1)
						{	
							
							var result={}
							result.token=new reify.Token(searchText.substring(0,i+1),definition)
							result.remainder=searchText.substring(i+1).slice(0)
							if (separator  && result.remainder.length >0)
							{
								var discard=result.remainder.match(separator)
								if (discard !== null)
								{
									if (discard[0] !==""){result.remainder=result.remainder.slice(discard[0].length)}
									_results.unshift(result)
								}
								else 
								{ 
									if (lax)  //don't care if there isn't a separator or boundary
									{
										_results.unshift(result)
									}
                                    else
                                    {
                                        let bound=result.remainder.match(boundary)
                                        if (bound !== null) _results.unshift(result)
                                    }
								}
							}
							else
							{
								_results.unshift(result)
							}
						}
						else
						{
							var result={}
							result.token=new reify.Token(searchText.substring(0),definition)
							result.remainder=""
							_results.unshift(result)
						}	
						
					})
				}	
				_trie = _trie[character]
			}
		}
	}
	if(longest|full)
	{
		_results= _results.slice(0,1)
		if(full && _results[0].remainder.length>0 ){_results=[]}
	}
	return _results
}
reify.Lexicon.prototype.split = function (searchText, ...settings) 
{
	var result
	var results=[]
	var fuzzyText=""
	var {fuzzySeparator}=settings[0]
	var remainder=searchText
	while(remainder.length>0)
	{
		result=this.search(remainder,...settings)
		if (result.length===0)
		{
			var word =remainder.split(fuzzySeparator,1)[0]
			fuzzyText+=word+" "
			remainder=remainder.slice(word.length+1)
		}
		else
		{
			
			if (fuzzyText.length>0)
			{
				results.push({token:new reify.Token(fuzzyText,{fuzzy:true, match:fuzzyText,}),remainder:remainder})
				fuzzyText=""
			}
			results=results.concat(result[0])
			remainder=result[0].remainder
			
		}
		
	}
	if (fuzzyText.length>0)
	{
		results.push({token:new reify.Token(fuzzyText.trim(),{fuzzy:true, match:fuzzyText}),remainder:""})
	}
	return results
}
reify.Lexicon.prototype.unregister=function(lexeme,definition)
{
	var _lexeme=lexeme
	var _trie = this.trie
	var j=0
	for (let i=0; i < _lexeme.length; i++)
	{
		var character=_lexeme.charAt(i)
		if ( ! _trie[character])
		{
			return this
		}
		else
		{	
			_trie = _trie[character]
		}
	}
	if (definition !== undefined)
	{
		if (_trie.hasOwnProperty("definitions"))
		{
			_trie.definitions=_trie.definitions.filter((def)=>
			{
				var mismatch=Object.entries(definition).some(([key,value])=>
				{
					if(def[key]!==value)
					{
						return true
					}
				})
				if (mismatch){return true}
				else {return false}	
			})
			if (_trie.definitions.length===0 )
			{
				delete _trie.definitions
			}
		}
	}
	else
	{
		delete _trie.definitions
	}
	return this	
}
// #endregion
// #region Narrative
// This function is assigned to objects like nouns and plot points to add narrative functionality
// example: {id:"my_noun", _:reify.narrative}
reify.narrative=function narrative(literals, ...expressions)  
{
	if (literals){this.narrative=reify.template(literals, ...expressions)}
	else {return this.narrative}
	return this
}
// #endregion
// #region Parser
reify.Parser=function Parser({lexicon,grammar,separator,boundary}={})
{
	if (this instanceof reify.Parser)
	{
		this.lexicon=lexicon
		this.grammar=grammar
        this.separator=separator
	}
	else
	{
		//return new Parser({lexicon:lexicon,grammar:grammar,separator:separator})
        return new Parser({lexicon:lexicon,grammar:grammar,separator:separator,boundary:boundary})
	}
}
reify.Parser.prototype.analyze=function(text)
{    
	var interpretations=[]
	var partialInterpretations=[]
	var completeInterpretations=[]
	var {snippets:result,errors,remainderErrors}=this.grammar.parse(text,this.lexicon,[],this.separator, this.boundary)
    if(errors.length>0 )
    {
        throw new Error("ERROR 0005: "+errors.join(" "))
    }
    
	if (result)
	{
		interpretations=interpretations.concat(result)
	}
    
 	interpretations.forEach((interpretation)=>
	{

		if (interpretation.remainder.length>0)
		{
			partialInterpretations.push(interpretation)
		}
		else
		{
			
			completeInterpretations.push(interpretation)
		}
	})
	if (completeInterpretations.length>0)
	{	var validInterpretations=completeInterpretations.filter(interpretation=>interpretation.valid===true)
		if(validInterpretations.length>0) {return {success:true, interpretations:validInterpretations}}
		else {return {success:true, interpretations:completeInterpretations}}
	}
	else
	{
		if (partialInterpretations.length>0)
		{

			console.log({success:false, interpretations: partialInterpretations.sort(function(first,second){return first.remainder.length - second.remainder.length})})

            throw new Error("ERROR 0005: "+remainderErrors.join(" "))
            
		}
		else
		{
			return { success: false}
		}
	}
}

// #endregion
// #region Rule
reify.Rule=function Rule() 
{
	if (this instanceof reify.Rule)
	{
		
		Object.defineProperty(this, "caseSensitive", {value:false, writable: true})
		Object.defineProperty(this, "entire", {value:false, writable: true})
		Object.defineProperty(this, "filter", {value:(definition)=>true, writable: true})
		Object.defineProperty(this, "full", {value:false, writable: true})
		Object.defineProperty(this, "greedy", {value:false, writable: true})
		Object.defineProperty(this, "keep", {value:true, writable: true})
		Object.defineProperty(this, "lax", {value:false, writable: true})
		Object.defineProperty(this, "longest", {value:false, writable: true})
		Object.defineProperty(this, "minimum", {value:1, writable: true})
		Object.defineProperty(this, "maximum", {value:1, writable: true})
		Object.defineProperty(this, "mode", {value:reify.Rule.all, writable: true})
		Object.defineProperty(this, "prefer", {value:false, writable: true})
		Object.defineProperty(this, "semantics", {value:(interpretation)=>true, writable: true})
		Object.defineProperty(this, "mismatch", {value:(interpretation)=>false, writable: true})
		Object.defineProperty(this, "separator", {value:null, writable: true})
        Object.defineProperty(this, "boundary", {value:null, writable: true})
		Object.defineProperty(this, "regex", {value:false, writable: true})

		return this
	}
	else
	{
		return new Rule()
	}
}
reify.Rule.all=Symbol('all')
reify.Rule.any=Symbol('any')
reify.Rule.apt= Symbol('apt')
reify.Rule.prototype.clone =function()
{
	var circularReferences=new Set()

	function _clone(rule)
	{
		var clonedRule= new reify.Rule().configure({caseSensitive:rule.caseSensitive, entire:rule.entire, filter:rule.filter, full:rule.full, greedy:rule.greedy, keep:rule.keep,longest:rule.lax,longest:rule.longest, minimum:rule.minimum, maximum:rule.maximum, mode:rule.mode, mismatch:rule.mismatch, prefer:rule.prefer, regex:rule.regex, semantics:rule.semantics, separator:rule.separator, boundary:rule.boundary})
		var entries=Object.entries(rule)
		entries.forEach(([key,value])=>
		{
			if (circularReferences.has(value))
			{
				clonedRule[key]=value
			}
			else
			{
				circularReferences.add(value)
				clonedRule[key]=_clone(value)
			}
			
		})
		return clonedRule
	}	
	return _clone(this)
}	
reify.Rule.prototype.configure =function({caseSensitive, entire, filter, full, greedy, keep, longest, lax, minimum,maximum, mode,mismatch,prefer, regex, semantics, separator,boundary}={})
{

	if(caseSensitive !== undefined){this.caseSensitive=caseSensitive}
	if(entire !== undefined){this.entire=entire}
	if(filter !== undefined){this.filter=filter}
	if(full !== undefined){this.full=full}
	if(greedy !== undefined){this.greedy=greedy}
	if(keep !== undefined){this.keep=keep}
	if(lax !== undefined){this.lax=lax}
	if(longest !== undefined){this.longest=longest}
	if(minimum !== undefined){this.minimum=minimum}
	if(maximum !== undefined){this.maximum=maximum}
	if(mode !== undefined){this.mode=mode}
	if(mismatch !== undefined){this.mismatch=mismatch}
	if(prefer !== undefined){this.prefer=prefer}
	if(regex !== undefined){this.regex=regex}
	if(semantics !== undefined){this.semantics=semantics}
	if(separator !== undefined){this.separator=separator}
    if(boundary !== undefined){this.boundary=boundary}
	return this
}
reify.Rule.prototype.parse =function(text,lexicon,errors,separator,boundary)
{
	var someText=text.slice(0)
	var results=[]
	var keys=Object.keys(this)
    let parsing=""
	if (keys.length>0)
	//non-terminal
	{
		switch (this.mode) 
		{
			case reify.Rule.all:
				if (this.maximum ===1 ){var candidates=[new reify.Interpretation({},someText)]}
				else {var candidates=[new reify.Interpretation([],someText)]}
				var counter = 0
				var phrases=[]
				var revisedCandidates=candidates.slice(0)
				while (counter<this.maximum)
				{
					for (let key of keys)
					{
						revisedCandidates.forEach(candidate=>
						{	
							var {gist,remainder,valid}=candidate
							//SNIP
							if (remainder.length>0)
							{

								var {snippets}=this[key].parse(remainder.slice(0),lexicon,errors,separator,boundary) 
                                if (snippets.length===0 && this[key].minimum>0)
                                {
                                    errors.unshift(`Unable to parse \`${remainder}\` as ${key}.`)
                                }
                                else
                                {
                                    snippets.forEach((snippet)=>
                                    {
                                        var phrase=new reify.Interpretation(gist,snippet.remainder,snippet.valid && valid,
                                            candidate.lexeme+remainder.slice(0,remainder.length-snippet.remainder.length))	
                                        if (this.maximum ===1 )
                                        {
                                            if(this[key].keep || !phrase.valid){phrase.gist[key]=snippet.gist}
                                        }
                                        else 
                                        {
                                            if(phrase.gist.length===counter){phrase.gist.push({})}
                                            if(this[key].keep  || !phrase.valid){phrase.gist[counter][key]=snippet.gist}
                                        }
                                        phrases.push(phrase)
                                    
                                    })
                                }
							}  
						}) //revisedCandidates
                        
						if (this[key].minimum===0)
						{
							if (this[key].greedy && phrases.length>0)
							{
								revisedCandidates=phrases.slice(0)
							}
							else
							{
								revisedCandidates=revisedCandidates.concat(phrases.slice(0))
							}
							
						}
						else 
						{
							revisedCandidates=phrases.slice(0)
						}
						phrases=[] //ready for next key
                        if (revisedCandidates.length===0) break  //no more candidates to work with
                        
					}//for keys
					counter++
					if (revisedCandidates.length===0)
					{
						break //while counter
					}
					else
					{
						if (counter >= this.minimum)
						{
							if (this.greedy){results=revisedCandidates.slice(0)}
							else {results=results.concat(revisedCandidates)}
						}
					}
				}
				break
			case reify.Rule.any:
					if (this.maximum ===1 ){var candidates=[new reify.Interpretation({},someText)]}
					else {var candidates=[new reify.Interpretation([],someText)]}
					var revisedCandidates=candidates.slice(0)
					for (let key of keys)
					{
						var counter = 0
						var phrases=[]
						while (counter<this.maximum)
						{
							revisedCandidates.forEach(candidate=>
							{
								var {gist,remainder,valid}=candidate
							//SNIP
								if (remainder.length>0)
								{
									var {snippets}=this[key].parse(remainder.slice(0),lexicon,errors,separator,boundary) 
									snippets.forEach((snippet)=>
									{
										var phrase=new reify.Interpretation(gist,snippet.remainder,snippet.valid && valid,
											candidate.lexeme+remainder.slice(0,remainder.length-snippet.remainder.length))
											//remainder.slice(0,remainder.length-snippet.remainder.length))
										if (this.maximum ===1 )
										{
											if(this[key].keep || !phrase.valid){phrase.gist=snippet.gist}
										}
										else 
										{
											if(phrase.gist.length===counter){phrase.gist.push({})}
											if(this[key].keep || !phrase.valid){phrase.gist[counter]=snippet.gist}
										}
										phrases.push(phrase)
										
									})
								}

							})
							if (this[key].minimum===0)
							{
								revisedCandidates=phrases.slice(0)
							}
							else
							{
								revisedCandidates=phrases.slice(0) 
							}
							phrases=[]
							counter++
							if (revisedCandidates.length===0){break}
							else
							{
								if (this.greedy){results=revisedCandidates.slice(0)}
								else {results=results.concat(revisedCandidates)}
							}
						}
						revisedCandidates=candidates.slice(0)  //go see if there are more alternatives that work.	
					}
					break
			case reify.Rule.apt:
				if (this.maximum ===1 ){var candidates=[new reify.Interpretation({},someText)]}
				else {var candidates=[new reify.Interpretation([],someText)]}
				var revisedCandidates=candidates.slice(0)
				for (let key of keys)
				{
					var counter = 0
					var phrases=[]
					while (counter<this.maximum)
					{
						revisedCandidates.forEach(candidate=>
						{
							var {gist,remainder,valid}=candidate
							//SNIP
							if (remainder.length>0)
							{
								var {snippets}=this[key].parse(remainder.slice(0),lexicon,errors,separator,boundary) 
								snippets.forEach((snippet)=>
								{
									var phrase=new reify.Interpretation(gist,snippet.remainder,snippet.valid && valid,
										candidate.lexeme+remainder.slice(0,remainder.length-snippet.remainder.length))
										//remainder.slice(0,remainder.length-snippet.remainder.length))
									if (this.maximum ===1 )
									{
										if(this[key].keep || !phrase.valid){phrase.gist=snippet.gist}
									}
									else 
									{
										if(phrase.gist.length===counter){phrase.gist.push({})}
										if(this[key].keep || !phrase.valid){phrase.gist[counter]=snippet.gist}
									}
									phrases.push(phrase)
									
								})
							}

						})
						
						if (this[key].minimum===0)
						{
							
							revisedCandidates=phrases.slice(0)
						}
						else
						{
							revisedCandidates=phrases.slice(0) 
						}
						phrases=[]
						counter++
						if (revisedCandidates.length===0){break}
						else
						{
							if (this.greedy){results=revisedCandidates.slice(0)}
							else {results=results.concat(revisedCandidates)}
						}
					}
					if (results.length>0)
                    {
                        break
                    } //found something that works, stop looking.
					revisedCandidates=candidates.slice(0)//try again with next key.	
				}
				break
		}
	}
	else
	{
	//terminal

		if (this.maximum ===1 ){var candidates=[new reify.Interpretation({},someText)]}
		else {var candidates=[new reify.Interpretation([],someText)]}
		var revisedCandidates=candidates.slice(0)
		
		var counter = 0
		var phrases=[]
		var rule = this
		while (counter<this.maximum)
		{
			revisedCandidates.forEach((candidate)=>
			{

				var {gist,remainder,valid}=candidate
				//SNIP
				if (remainder.length>0)
				{
					var snippets=lexicon.search(remainder, {regex:rule.regex,separator:rule.separator??separator??/^\s+/, boundary:rule.boundary??boundary,caseSensitive:rule.caseSensitive, longest:rule.longest, full:rule.full, lax:rule.lax})

					snippets.forEach((snippet)=>
					{
						if (this.filter(snippet.token.definition))
						{
							var phrase=new reify.Interpretation(gist,snippet.remainder,snippet.valid && valid,
								candidate.lexeme+remainder.slice(0,remainder.length-snippet.remainder.length))
								//remainder.slice(0,remainder.length-snippet.remainder.length))
							if (this.maximum ===1 )
							{
								if(this.keep || !phrase.valid){phrase.gist=snippet.token}
							}
							else 
							{
								if(phrase.gist.length===counter){phrase.gist.push({})}
								if(this.keep || !phrase.valid){phrase.gist[counter]=snippet.token}
							}
							phrases.push(phrase)
						}	
						
					})
				}
			})
			
			revisedCandidates=phrases.slice(0) //}
			phrases=[]
			counter++
			if (revisedCandidates.length===0)
			{
				
				break
			}
			else
			{
				if (this.greedy){results=revisedCandidates.slice(0)}
				else {results=results.concat(revisedCandidates)}
			}
		}
		
	}	
	results=results.map(interpretation=>
	{
		if(interpretation.remainder.length>0 && this.entire)
		{
			interpretation.valid=false
		}
		return interpretation
	})
	
	if (!results.some(interpretation=>interpretation.valid))
	{
		if (results.length===0){results=candidates}
		results=results.reduce((revisedResults, interpretation) =>
		{
			var revisedInterpretation=this.mismatch(interpretation)
			if (revisedInterpretation)
			{
				if (revisedInterpretation)
				{
					revisedResults.push(revisedInterpretation)
				}
			}
			return revisedResults

		},[])

	}

	results=results.reduce((revisedResults, interpretation) =>
	{
		if (interpretation.valid)
		{
			var revisedInterpretation=this.semantics(interpretation)
			if (revisedInterpretation)
			{
				if (revisedInterpretation === true)
				{
					revisedResults.push(interpretation)
				}
				else
				{
					revisedResults.push(revisedInterpretation)
				}
			}
		}
		else
		{
			revisedResults.push(interpretation)
		}
		return revisedResults

	},[])
	if (results.length>0)
	{
		return {snippets:results,errors:[],remainderErrors:errors}	
	}
	else
	{
		return {snippets:[],errors:errors}
	}	
}
reify.Rule.prototype.snip =function(key,rule)
{
	
	if (rule instanceof reify.Rule)
	{
		this[key]=rule
	}
	else
	{
		this[key]=new reify.Rule(key)

		this[key].caseSensitive=this.caseSensitive
		this[key].full=this.full
		this[key].longest=this.longest
		this[key].separator=this.separator
		
	}	
	return this		
}
// #endregion
// #region Passage

reify.Passage =class Passage
{
	constructor(...precursor) 
	{
		Object.defineProperty(this,"id",{value:"",writable:true})
		Object.defineProperty(this,"echo",{value:false,writable:true})
		Object.defineProperty(this,"ended",{value:false,writable:true})
		Object.defineProperty(this,"_locked",{value:false,writable:true})
		Object.defineProperty(this,"_erasable",{value:false,writable:true})
		Object.defineProperty(this,"passages",{value:[],writable:true})
		Object.defineProperty(this,"re",{value:false,writable:true})
		Object.defineProperty(this,"_property",{value:"",writable:true})
		Object.defineProperty(this,"_results",{value:[],writable:true})
		Object.defineProperty(this,"_seed",{value:reify.util.random().seed,writable:true})
		Object.defineProperty(this,"_tag",{value:"",writable:true})
		Object.defineProperty(this,"tags",{value:{},writable:true})
		//Object.defineProperty(this,"tally",{value:0,writable:true})
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
						this.tags[key].erasable=true
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

		//this.erase()  //get rid of leftovers from last fill
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
	lock(id)
	{
		this._locked=true
		return this
	}
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
			if (property.toUpperCase()===property) 
			{
				return new reify.Passage(target).tag(property.toLowerCase())
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
	 //_.a.b.tag.data1.data2 becomes _.a(b(datadata1(echo(tag)))))
	 //_.a.tags.b becomes 
	 //_.a.cap.pick("cat","dog","frog")
	 //t=>_.a.cap(t.noun.description.z)

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
		//_.a.b.c.TAG() becomes _.a(b(c())) c() is tagged
	 	//_.a.TAG.b.c() becomes _.a(b(c())) b(c()) is tagged
		if (property.toUpperCase()===property)  //property is request to create a tagged passage
		{
			var finalPassageFactory=(...precursor)=>template(new reify.Passage(...precursor).tag(property.toLowerCase()))
			var priorPassageFactory=(...precursor)=> new reify.Passage(...precursor).tag(property.toLowerCase())
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
			/*Object.assign
			(
				{},
				(result[property].data?{value:result[property].data()}:{value:result[property]})
			))*/
			this.text=this.toString()
			//this.tally=this.passages[0].value.tally
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
			
			/*Object.assign
			(
				{},
				(result.value[property].data?{value:result.value[property].data()}:{value:result.value[property]})
			))*/
			this.text=this.toString()
			//this.tally=this.passages[0].value.tally
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
		//	this.tally=target.tally
			return this.results
		}

		get inner()
		{
			var counter=0
			var target=this
			while (target.constructor.name === "antePassage")
			{
				counter++
				target=target.passages[0] //.value
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

// #endregion
// #region narrative

// #region Token
reify.Token=function Token(lexeme="",definition)
{
	if (this instanceof reify.Token)
	{
		this.lexeme=lexeme.slice(0)
		this.definition=definition
		return this
	}
	else
	{
		return new Token(lexeme,definition)
	}
}
reify.Token.prototype.clone=function() 
{
	return new reify.Token(this.lexeme,this.definition)
}
// #endregion
// #endregion
// #region viewpoint
reify.viewpoint=function(actor)
{
	if(actor)
	{
		this._viewpoint=actor
	}	
	return this._viewpoint
}
// #endregion
reify.clock=new Date()
reify.interval= 60000  //1 minute
reify.turn=1
reify.glossary=new reify.Lexicon()
reify.grammar=new reify.Rule()
reify.parser=null
reify.tense={imperative:0,present:1, past:2, perfect:3}
reify._viewpoint=null
reify.undoLength=10
reify.lang={}
reify.phrasebook_handler=
{
	get: function(target, property,receiver) 
	{ 
		if (Reflect.has(target,property)){return Reflect.get(target,property,receiver)}
		else 
		{
			//magic properties
			target[property]=new Proxy({},reify.phrasebook_handler)
			return target[property]
		}
	}
}
reify.phrasebook=new Proxy({},reify.phrasebook_handler)

reify.configure=function(options)
{
	//DEFECT TO DO seed, name, author, etc.
}

// #region storytelling
reify.tell=function(timeline="player") 
{
	while(this.storyline[timeline].length>0)
	{
		Object.keys(this.storyline).forEach(timeline=>
		{
			this.storyline[timeline].forEach((episode,index)=>
			{
				if (!episode.start() || episode.start() <= this.clock)
				{
					if (episode.resolve(this.clock).told){episode.narrate()}
				}
			})
			this.storyline[timeline]=this.storyline[timeline].filter(episode=>!episode.told)
		})
		this.tick()
	}	
	this.turn++
	return this
}

reify.introduce=function(episode) 
{
	var timeline=episode.timeline()
	if (!this.storyline.hasOwnProperty(timeline))
	{
		this.storyline[timeline]=[]
	}

	this.storyline[timeline].push(episode)
	return this
}	
// #endregion

/* A turn is a processing of all the episodes on the the storyline.  An episode is a plotpoint.narrate with bound arguments.*/ 

reify.tick=function(ticks=1)
{
	this.clock.setTime(this.clock.getTime() + (this.interval*ticks))
}

// #region semantics

reify.net={}  //semantic network, where nouns and facts live.
reify.classes={}  //Classes that users might want to extend
reify.proxies={}
reify.proxies.newless= //instantiate a class without new operator
{
	apply: function (target, thisArg, args)  //temporary proxy for creating new-less class instances
	{
		return new target(...args)
	}
} 


// #region adjective

reify.adjective=function(literals, ...expressions)
//adjective`dark,dim,bright`.describes`lighting`  -- enum
//adjective`locked`.opposite`unlocked`.describes`security`  -- boolean adjective
//.adjective`tall`.describes(nouns=>nouns.forEach(noun=>noun.height>70)) // tall:nounList=>nounList.forEach(noun=>noun.height>70)
//.adjective`very tall`.describes(nouns=>nouns.forEach(noun=>.height>74)) // very_tall:
//.adjective`tallest`.describes(nouns=>[nouns.sort(a,b=>a.height>b.height)[0]]) // tallest:

{

	var adjectives=reify.formatName(literals, ...expressions).split(",")
		
	if (adjectives.length>1){var type="enum"}
	else{ var type="boolean"}	
	var adjOpposite=null
	var describes=(literals, ...expressions)=>
	{
		if(literals===undefined) throw new Error(`ERROR 0001: Adjective ${adjectives.toString} describes undefined property.`)
        if (typeof literals=== "function"){type="function"}
        else {var property=reify.formatName(literals, ...expressions)}
		adjectives.forEach((adjective,index) => 
		{
            if (type ==="function")
            {
                reify.glossary.register(adjective).as({part: "adjective", value:literals})
            }
			if (type==="enum")
			{
				reify.glossary.register(adjective).as({part: "adjective",key:property, value:noun=>noun[property]===index
                })
			}
			else if(type=="boolean")
			{
				reify.glossary.register(adjective).as({part: "adjective",key:property, value:noun=>noun[property]})
				if (adjOpposite)
				{
					reify.glossary.register(adjOpposite).as({part: "adjective",key:adjOpposite,value:noun=>noun[property]===false})
				}
			}
		})
		return reify
	}
	var opposite=(literals, ...expressions)=>
	{
		type="boolean"
		adjOpposite=reify.formatName(literals, ...expressions)
		return {describes:describes}
	}

	if (type==="enum") return {describes:describes}
	else return {describes:describes, opposite:opposite}
}
// #endregion

// #region Fact

reify.facts=function(literals, ...expressions)
    { 
        let {success,interpretations}=reify.statementParser.analyze(reify.toString(literals, ...expressions))
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
                interpretations[0].gist.forEach(statement=> new reify.classes.fact(statement))
            }
        }
        else
        {
            console.log(interpretations)
            throw new Error("ERROR 0005: Unable to parse reify source code.")
        }
        return this
    }

// #endregion

// #region noun
reify.proxies.noun=
{	
	//noun.property(value) sets value of property and returns noun
	//noun.property() returns value of property

	get: function(target, property, receiver) //receiver is proxy.
	{
		var methods=
		{
			
			description:(literals, ...expressions)=>
			{
				if(literals===undefined) return target.description
				target.description=reify.template._(literals,...expressions)
				return receiver
			},
			
			name:(literals, ...expressions)=>
			{
				if(literals===undefined) return target.name
				let name=reify.formatName(literals, ...expressions)
				target.name=name
				reify.glossary.register(name).as({part: "noun", key:target.id})
				return receiver
			},
		}
		if (typeof target[property] === "function") return target[property]
		if(methods.hasOwnProperty(property)) return methods[property]
		if (property==="id") return target[property]
        if (property==="_indexes") return target[property]
        if (property==="scenes") return target[property]

		return function(value)
		{
			if (value===undefined){return target[property]}

			//DEFECT to do: dispatch proposed change to plot
			target[property]=value

			//DEFECT to do: dispatch change to plot

			return receiver
		}

	}
	
}
reify.noun=function(literals, ...expressions) {return new reify.classes.noun(literals,...expressions)}
// #endregion

// #region classes


reify.classes.fact= class Fact
    {
        constructor(statement)
        {
    
            let fact=reify.net[statement.id]

            if (fact) //update existing fact.
            {
                history[reify.turn]={clock:reify.clock,tense:fact.tense,mood:fact.mood,polarity:fact.polarity }
                fact.tense=statement.tense
                fact.mood=statement.mood
                fact.polarity=statement.polarity
               
            }
            else
            {
                Object.defineProperty(this, "id",{value:statement.id,enumerable:false})
                Object.defineProperty(this, "predicate",{value:statement.predicate,enumerable:false})
                Object.defineProperty(this, "tense",{value:statement.tense,enumerable:false})
                Object.defineProperty(this, "mood",{value:statement.mood,enumerable:false})
                Object.defineProperty(this, "polarity",{value:statement.polarity,enumerable:false})
                Object.defineProperty(this, "nouns",{value:statement.nouns,enumerable:false})
                Object.defineProperty(this, "history",{value:[],enumerable:false})
                this.history[reify.turn]={clock:reify.clock,tense:this.tense,mood:this.mood,polarity:this.polarity }
                fact=reify.net[statement.id]=this
                
            }
             fact.nouns.forEach((noun,index)=>
            {
                let i=noun._indexes
                if (i[index] instanceof reify.Reality) i[index].add(this)
                else i[index]=new reify.Reality(this)
            })
            fact.predicate._index.add(this)
            return fact
        }
        get subject(){return this.nouns[0]}
        get directObject(){return this.nouns[1]}
        get indirectObject(){return this.nouns[2]}
        get verb(){return this.predicate.verb}
        get prepositions(){return this.predicate.prepositions}
        //get prepositions(){return Object.keys(this).slice(2)}
        //get verb(){return Object.keys(this)[1]}
    }
reify.classes.noun=class Noun
	{
		constructor(literals, ...expressions) // maybe template literal notation or function notation
		{
            let name=reify.toString(literals, ...expressions)
            Object.defineProperties(this,
                {
                    id:{value:reify.formatId(name),enumerable:false},
                    description:{value:reify.template._,enumerable:false,writable:true},
                    name:{value:reify.formatName(name),enumerable:false,writable:true},
                    attributive:{value:false,enumerable:false,writable:true},
                    _indexes:{value:[],enumerable:false,writable:false},
                    scenes:{value:new Set(),enumerable:false,writable:false}
                })
			let noun=new Proxy(this,reify.proxies.noun)
			reify.net[this.id]=noun
			reify.glossary.register(this.name).as({part: "noun",  key:this.id})
			return noun
		}
		aka(literals, ...expressions)
		{
			reify.glossary.register(reify.formatName(literals, ...expressions)).as({part: "noun", key:this.id})	
			return this
		}
		kind(literals, ...expressions)
		{
			let kind=reify.net[reify.formatId(literals, ...expressions)]
            
			if (kind)
			{
				Object.keys(kind).forEach((key)=>
				{
					this[key]=kind[key]()
				})

                //to do: kinds need to go into the lexicon with a part=attributive
                if (!kind.attributive)
                {
                    kind.attributive=true
                    reify.glossary.register(kind.name).as({part: "attributive", key:kind})	

                }


			}
			else throw new Error("ERROR 0002: Unable to assign kind ${kind} to ${this.id}.")
			return this
		}

	}
reify.classes.Predicate=class Predicate
{
	constructor(literals, ...expressions) // maybe template literal notation or function notation
	{
		let name=reify.toString(literals, ...expressions)
		let p_strings=name.split(" ")
		Object.defineProperties(this,
        { 
            id:{value:reify.formatId(name),enumerable:false},
            verb:{value:reify.formatName(p_strings[0]),enumerable:false,writable:false},
            prepositions:{value:p_strings.splice(1)??[],enumerable:false,writable:false},
            mutual:{value:false,enumerable:false},
            exclusive:{value:false,enumerable:false},
            _index:{value:new reify.Reality(),enumerable:false,writable:false},
            copular:{value:false,enumerable:false},
            scenes:{value:new Set(),enumerable:false,writable:false}
        })
		this.#conjugate(this.verb,false)
		this.prepositions.forEach(preposition=>
		{
			reify.glossary.register(preposition).as({part:"preposition", key:preposition, predicate:this})
		})	
		//return new Proxy(this,reify.proxies.predicate)		for getter/setters do we need this?
        return this
	}

	adverb(literals, ...expressions)
	{
		reify.glossary.register(reify.toString(literals, ...expressions)).as({part: "adverb",  predicate:this})
		return this

	}
	aka(literals, ...expressions)  //To DO: delete because predicates are different from commands?
	{
		this.#conjugate(reify.toString(literals, ...expressions),false)
		return this
	}
    check(reality)
	{
		//TO DO: use reality to find facts in reify.net that match 

		if (reality.size>0) return true
		return false
	}
    #conjugate(verb,converse)
    {
        let particles=verb.split(" ")
        if (particles[0].slice(0,2) ==="be")  //conjugate "be north of" or passive constructions for example 
        {

            let complement=" "+particles.slice(1).join(" ")
            reify.glossary.register("is"+complement)//foyer is north of cloakroom
                .as({part:"verb",predicate:this,tense:reify.lang.present,polarity:reify.lang.affirmative,converse:converse})
            reify.glossary.register("is not"+complement)//foyer is not north of cloakroom
                .as({part:"verb",predicate:this,tense:reify.lang.present,polarity:reify.lang.negative,converse:converse})
            reify.glossary.register("are"+complement)//trees are north of meadow
                .as({part:"verb",predicate:this,tense:reify.lang.present,polarity:reify.lang.affirmative,converse:converse})
            reify.glossary.register("are not"+complement)//trees are not north of meadow
                .as({part:"verb",predicate:this,tense:reify.lang.present,polarity:reify.lang.negative,converse:converse})
            reify.glossary.register("was"+complement)//foyer was north of cloakroom
                .as({part:"verb",predicate:this,tense:reify.lang.past,polarity:reify.lang.affirmative,converse:converse})
            reify.glossary.register("was not"+complement)//foyer was north of cloakroom
                .as({part:"verb",predicate:this,tense:reify.lang.past,polarity:reify.lang.negative,converse:converse})
            reify.glossary.register("were"+complement)//trees were north of meadow
                .as({part:"verb",predicate:this,tense:reify.lang.past,polarity:reify.lang.affirmative,converse:converse})
            reify.glossary.register("were not"+complement)//trees were not north of meadow
                .as({part:"verb",predicate:this,tense:reify.lang.past,polarity:reify.lang.negative,converse:converse}) 
        }
        else
        {
            
            reify.glossary.register(reify.lang.es(verb)). //player carries ring
                as({part:"verb",predicate:this,tense:reify.lang.present,polarity:reify.lang.affirmative,converse:converse})
            reify.glossary.register("does not "+verb) //player does not carry ring
                .as({part:"verb",predicate:this,tense:reify.lang.present,polarity:reify.lang.negative,converse:converse})
            reify.glossary.register(verb) //people carry treasure chest
                .as({part:"verb",predicate:this,tense:reify.lang.present,polarity:reify.lang.affirmative,converse:converse})
            reify.glossary.register("do not "+verb) //people do not carry treasure chest
                .as({part:"verb",predicate:this,tense:reify.lang.present,polarity:reify.lang.negative,converse:converse})
            reify.glossary.register(reify.lang.ed(verb)) //player carried ring. people carried treasure chest
                .as({part:"verb",predicate:this,tense:reify.lang.past,polarity:reify.lang.affirmative,converse:converse})
            reify.glossary.register("did not "+verb) //player did not carry ring. people did not carry treasure chest
                .as({part:"verb",predicate:this,tense:reify.lang.past,polarity:reify.lang.negative,converse:converse})

        }

        //carried ring endangers the plan  //adjective
        //carrying player endangers the plan //adjective

        reify.adjective(reify.lang.ing(verb)).describes(noun=>noun._indexes[0].filter(predicate._index).size>0)
        reify.adjective(reify.lang.ed(verb)).describes(noun=>noun._indexes[1].filter(predicate._index).size>0)

        return this
    }
	
    converse(literals, ...expressions)
	{
		this.#conjugate(reify.toString(literals, ...expressions),true)
		return this
	}
    
	select(reality)
	{
		//filter reality by predicate. Typically overridden for virtual predicates
        if (reality.isEmpty) reality.concat(this._index)
        else reality.filter(this._index)
		return reality
	}
}
reify.classes.Scene=class Scene
{
    constructor(literals, ...expressions)
    {
        
        
        var source=reify.toString(literals, ...expressions)
        
        let {success,interpretations}=reify.selectionParser.analyze(source)
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
            else  //add scene to nouns
            {
                let gist=interpretations[0].gist
                Object.defineProperties(this,
                {   
                    selector:{value:gist.selector,enumerable:false,writable:false},
                    storylines:{value:[],enumerable:false,writable:true}, //because underscores are lines that denote a passage
                    plot:{value:(reality)=>true,enumerable:false,writable:true}                    
                })
                
                
                gist.nouns.forEach(noun=>noun.scenes.add((this)))
                gist.predicates.forEach(predicate=>predicate.scenes.add((this)))

                
                return this
            }
            
        }
        else
        {
            console.log(interpretations)
            throw new Error("ERROR 0005: Unable to parse reify source code.")

        }

    }
    narrate(storyline)
    {
        return this
    }
    action(plot)
    {
        this.plot=()=>plot(this.selector())
        return this
    }
    _(literals,...expressions)
    {
        return this
    }
}

//reify.predicate=new Proxy(reify.classes.Predicate,reify.proxies.newless)
reify.predicate=function(literals, ...expressions)
{
   return new reify.classes.Predicate(literals, ...expressions)
}

// #endregion

// #region reality
reify.Reality=class Reality 
{
    
    constructor(...facts)  //Realities can be made from facts or other realities
    {
        Object.defineProperty(this, "wildcards",{value:{},enumerable:false,writable:true})
        Object.defineProperty(this, "set",{value:new Set(),enumerable:false,writable:true})
        facts.forEach(fact=>
        {
            if (fact instanceof reify.Reality) this.set=this.set.union(fact.set)
            else if (fact instanceof reify.classes.fact) this.set.add(fact)

        })
        return this

    }
    add(...items)
    {
        items.forEach(item=>
        {
            if (item instanceof reify.classes.fact)  this.set.add(item)
            else if (item instanceof reify.Reality) this.set=this.set.union(item.set)

        })
        return this
    }

    filter(...realities) //intersection of two realities sets
    {
        realities.forEach(reality=>
        {
            this.set.intersection(reality.set)
        
        })
        
        return this
    }
    get isEmpty(){return this.set.size===0}
    get size(){return this.set.size}
    subtract(...items)
    {
        items.forEach(item=>
        {
            if (item instanceof reify.classes.fact)  this.set.delete(item)
            else if (item instanceof reify.Reality) this.set=this.set.intersection(item)
        })
        
        return this
    }
    forEach(task)
    {
        this.set.forEach(task)
        return this
    }
    now(literals, ...expressions)
    {
        // for each fact, replace each placeholder with noun id 
        // reify each statement
        // To Do: process resulting reality through plot.
        //now`The player does not carry [thing]. The _room_ containing player contains [thing].`
        //now`The player does not carry [thing]. The _room_ occupied by player contains [thing].`

        /*
            get reality of facts
            gather scenes from nouns and predicates
            sort scenes into an array named plot by specificity.
            call plot[0].unfold(plot[].slice(1),this)
        */
        let source=reify.toString(literals, ...expressions).split(/(\[.*?\])/)
        this.set.forEach(fact=>
        {
            let revisedSource=source.map(text=>
            {
                if (text.startsWith("[") && text.endsWith("]"))
                {
                    text=text.slice(1,-1)
                    let noun=this.placeholder[text]
                    if (noun)
                    {
                        text= fact.nouns[noun.index].id
                    }
                }
                return text
            }).join("")
            console.log(reify.facts(revisedSource))
        })
            
        return this
    }
}

// #endregion

// #region dsl


/* 

EBNF:

    leftBracket=>/^\[/
    rightBracket=>/^\]/
    leftParen=>/^\(/
    rightParen=>/^\)/
    period=>/^\./
    wildcard=>/^_[a-zA-Z]\w*_/
	placeholder=>/^#[a-zA-Z]\w*[a-zA-Z _]#/

    selections=>(selection period)+ //select existing facts into a reality
    selection=>subject predicate 
	subject=>nounClause
    nounClause=>fact | nounPhrase
    fact=>leftBracket nounPhrase gerund directObject prepositionalPhrase* rightBracket
    nounPhrase=>adjectives* attributive? noun relativeClauses*
    article=>lexiconArticle
    adjectives=>lexiconAdjective
    attributive=>lexiconAttributive
    relativeClauses=>relativizer predicate
	noun=>lexiconNoun|wildcard|placeholder
	predicate=>verb directObject prepositionalPhrases*
    verb=>lexiconVerb
    prepositionalPhrases=>preposition target
    directObject=>nounClause
    target=>nounClause

    
    statements=>(statement period)+  //create one or more facts
    statement=>subject predicate 
	subject=>fact|noun
    fact=>leftBracket argument gerund directObject prepositionalPhrases* rightBracket
    noun=>lexiconNoun|placeholder
	placeholder=>/^#[a-zA-Z]\w*[a-zA-Z _]#/
    predicate=>verb directObject prepositionalPhrases*
    prepositionalPhrases=>preposition target
    directObject=fact |noun | adjective //adjective valid for copular predicates only
    target=>fact|noun

    condition => term termOperations*
    termOperations=> orOperator term
    term => factor factorOperations*
    factorOperations=> andOperator factor
    factor => selection
    factor=>notOperator factor
    factor=>leftParen condition rightParen
    
*/

reify.dsl={}


//Build condition parser  -- apply logical operators to selections to arrive at a truth value. 






//reusable rules

reify.dsl.noun=reify.Rule().configure({mode:reify.Rule.apt})
	.snip(0)
	.snip(1) //placeholder
reify.dsl.noun[0]
    .configure({filter:(definition)=>definition?.part==="noun"})	
reify.dsl.noun[1].configure({regex:/^#[a-zA-Z]\w*/})
reify.dsl.preposition=reify.Rule().configure({filter:(definition)=>definition?.part==="preposition"})
reify.dsl.verb=reify.Rule().configure({filter:(definition)=>definition?.part==="verb"})


/*statement grammar 
    statements=>(statement period)+  //create one or more facts
    statement=>subject verb directObject prepositionalPhrases*
    subject=>lexiconNoun|placeholder
    placeholder=>/^#[a-zA-Z]\w*[a-zA-Z]/
    prepositionalPhrases=>preposition target
    directObject noun | adjective //adjective valid for copular predicates only
    target=>noun  
*/
reify.dsl.statements=reify.Rule()
    .snip("statement").snip("period")
    .configure({maximum:Infinity, semantics:interpretation=>
    {
        interpretation.gist=interpretation.gist.reduce((a,b)=>a.concat(b.statement),[])
        return true
    }})
reify.dsl.statements.period.configure({regex:/^\./,lax:true})
reify.dsl.statements.statement=reify.Rule()
    .snip("subject",reify.dsl.noun).snip("predicate")
    .configure({semantics:interpretation=> //Due to wildcards, each statement may involve multiple facts.  
    {
        let gist =interpretation.gist
        let directObject=gist.predicate.directObject
        let verb=gist.predicate.verb.definition
        let predicate=verb.predicate
        let argumentList=[]

        if (verb.converse)
        {
            argumentList.push(reify.net[directObject.definition.key])
            argumentList.push(reify.net[gist.subject.definition.key])
        }
        else
        {
            argumentList.push(reify.net[gist.subject.definition.key])
            argumentList.push(reify.net[directObject.definition.key])
        }
        predicate.prepositionalPhrases?.forEach(phrase=>argumentList.push(reify.net[phrase.target.definition.key]))

        let id=argumentList[0].id +" "+reify.lang.ing(predicate.id)+" "+argumentList[1].id
        for (let index = 2; index < argumentList.length; index++) {id=id+" "+predicate.prepositions[index-2]+" "+argumentList[index].id}
        id="["+id+"]"
        interpretation.gist={id:id,predicate:predicate,tense:verb.tense,mood:verb.mood,voice:verb.voice,polarity:verb.polarity,nouns:argumentList}
        return true

    }})

reify.dsl.statements.statement.predicate
    .snip("verb",reify.dsl.verb).snip("directObject",reify.dsl.noun).snip("prepositionalPhrases")
    .configure({semantics:interpretation=>
    {
        let gist =interpretation.gist
        let predicate=gist.verb.definition.predicate
        let prepositions=(gist.prepositionalPhrases??[]).map(preposition=>preposition.definition.key)
        if (prepositions.length !== predicate.prepositions.length) return false
        prepositions.forEach((preposition,index)=>{if(preposition!==predicate.prepositions[index]) return false})
        return true
    }})
reify.dsl.statements.statement.predicate.prepositionalPhrases
    .configure({minimum:0,maximum:Infinity,greedy:true})
    .snip("preposition",reify.dsl.preposition).snip("target",reify.dsl.noun)
reify.statementParser=reify.Parser({ lexicon: reify.glossary, grammar: reify.dsl.statements, boundary:/^[\.]/,separator:/^[\s\,]+/ })


/*statement grammar 
    statements=>(statement period)+  //create one or more facts
    statement=>subject verb directObject prepositionalPhrases*
    subject=>lexiconNoun|placeholder
    placeholder=>^#[a-zA-Z]\w*
    prepositionalPhrases=>preposition target
    directObject noun | adjective //adjective valid for copular predicates only
    target=>noun  
*/


/*  condition grammar
    condition => term termOperations*
    termOperations=> orOperator term
    term => factor factorOperations*
    factorOperations=> andOperator factor
    factor => selection
    factor=>notOperator factor
    factor=>leftParen condition rightParen
*/

/*Selection grammar
    selection=subject verb directObject prepositionalPhrases* //select existing facts into a reality
	subject=>nounClause
    nounPhrase=>adjectives* noun relativeClauses*  //to do: make sure kind generates an adjective for the kind.  I think it does
    adjectivePhrase=>lexiconAdjective
    relativeClauses=>relativizer verb directObject prepositionalPhrases*
	noun=>lexiconNoun|wildcard|placeholder  //wildcard is the form _wildcard_name_ placeholder is of the form #wildcard_name
	verb=>lexiconVerb
    prepositionalPhrases=>preposition target
    directObject=>nounClause
    target=>nounClause 

    adjectivePhrase => term termOperations*
    termOperations=> orOperator term
    term => factor factorOperations*
    factorOperations=> andOperator factor
    factor => adjective
    factor=>notOperator factor
    factor=>leftParen adjectivePhrase rightParen



*/



////selection grammar
reify.dsl.adjective=reify.Rule().configure({filter:(definition)=>definition?.part==="adjective",semantics:interpretation=>
{
    interpretation.gist= {filter:interpretation.gist.definition.value,specificity:[0,1]}
    return true
}})

reify.dsl.adjectivePhrase=reify.Rule()
    .snip("term").snip("termOperations")
    .configure({minimum:0,semantics:interpretation=>
    {
        let gist=interpretation.gist
        let term=gist.term
        let operations=gist.termOperations??[]
        let specificity=term.specificity[1] + operations.reduce((a,b)=>a+b.term.specificity[1],0)
        let filter=noun=>operations.reduce((a,b)=>a || b.filter(noun),term.filter(noun))
        interpretation.gist={filter:filter,specificity:[0,specificity]}
        return true
    }})
reify.dsl.adjectivePhrase.term
    .snip("factor").snip("factorOperations")
    .configure({semantics:interpretation=>
    {
        let gist=interpretation.gist
        let factor=gist.factor
        let operations=gist.factorOperations??[]
        let specificity=factor.specificity[1] + operations.reduce((a,b)=>a+b.factor.specificity[1],0)
        let filter=noun=>operations.reduce((a,b)=>a && b.filter(noun),factor.filter(noun))
        interpretation.gist={filter:filter,specificity:[0,specificity]}
        
        return true
    }})
reify.dsl.adjectivePhrase.termOperations.snip("orOperator").snip("term",reify.dsl.adjectivePhrase.term)
    .configure({minimum:0,maximum:Infinity})
reify.dsl.adjectivePhrase.termOperations.orOperator.configure({filter:(definition)=>definition?.part==="orOperator"})
reify.dsl.adjectivePhrase.term.factorOperations.snip("andOperator").snip("term",reify.dsl.factor)
    .configure({minimum:0,maximum:Infinity})
reify.dsl.adjectivePhrase.term.factorOperations.andOperator.configure({filter:(definition)=>definition?.part==="andOperator"})
reify.dsl.adjectivePhrase.term.factor
    .snip(0,reify.dsl.adjective)
    .snip(1) //not factor
    .snip(2) // grouping (adjective phrase)
    .configure({mode:reify.Rule.apt})

reify.dsl.adjectivePhrase.term.factor[1]
    .snip("notOperator").snip("factor",reify.dsl.adjectivePhrase.term.factor)
    .configure({semantics:(interpretation)=>
    {
        interpretation.gist={filter:(noun)=>!interpretation.gist.factor.filter(noun),specificity:[0,interpretation.gist.factor.specificity]}
        return true
    }})
reify.dsl.adjectivePhrase.term.factor[1].notOperator
    .configure({filter:(definition)=>definition?.part==="notOperator"})

reify.dsl.adjectivePhrase.term.factor[2]
    .snip("leftParen").snip("adjectivePhrase",reify.dsl.adjectivePhrase).snip("rightParen")
    .configure({semantics:(interpretation)=>
    {
        interpretation.gist= interpretation.gist.adjectivePhrase
        return true
    }})

reify.dsl.adjectivePhrase.term.factor[2].leftParen.configure({regex:/^\(/,lax:true})
reify.dsl.adjectivePhrase.term.factor[2].rightParen.configure({regex:/^\)/,lax:true})

reify.dsl.nounPhrase=reify.Rule()
   .snip("adjectivePhrase",reify.dsl.adjectivePhrase).snip("noun",reify.dsl.noun.clone()).snip("relativeClause") 
   .snip("noun",reify.dsl.noun.clone())
   .configure({semantics:interpretation=>
    {
        
        return true
        
    }})
reify.dsl.prepositionalPhrases=reify.Rule()
    .snip("preposition",reify.dsl.preposition).snip("target",reify.dsl.nounPhrase)
    .configure({minimum:0,maximum:Infinity,greedy:true})    
reify.dsl.nounPhrase.noun.snip(2)
reify.dsl.nounPhrase.noun[2].configure({regex:/^_[a-zA-Z]\w*_/})

reify.dsl.nounPhrase.relativeClause
    .snip("relativizer").snip("verb",reify.dsl.verb).snip("directObject",reify.dsl.nounPhrase).snip("prepositionalPhrases",reify.dsl.prepositionalPhrases)
    .configure({minimum:0})
reify.dsl.nounPhrase.relativeClause.relativizer.configure({filter:(definition)=>definition?.part==="relativizer"})
reify.dsl.selection=reify.Rule().snip("subject",reify.dsl.nounPhrase).snip("predicate")
    .configure({semantics:interpretation=> //Due to wildcards, each selection may involve multiple facts.  
    {
        let gist =interpretation.gist
        let directObject=gist.predicate.directObject
        let directObjectNoun=directObject.noun.definition.fuzzy?noun.definition.match:directObject.noun.definition.key
        let subject=gist.subject
        let subjectNoun=subject.noun.definition.fuzzy?subject.noun.definition.match:subject.noun.definition.key
        let predicate=gist.predicate
        let verb=predicate.verb.definition
        let argumentList=[]
        let wildcards={}
        let specificity=[0,0]
        let nouns={}

        if (verb.converse)
        {
            argumentList.push({noun:directObjectNoun,adjectivePhrase:directObject.adjectivePhrase}) //filter will eventually include restrictive phrases function
            argumentList.push({noun:subjectNoun,adjectivePhrase:subject.adjectivePhrase})
            if (subjectNoun.startsWith("_")){wildcards.subjectNoun=1} 
            if (directObjectNoun.startsWith("_")){wildcards.directObjectNoun=0} 
            
        }
        else
        {
            argumentList.push({noun:subjectNoun,adjectivePhrase:subject.adjectivePhrase})
            argumentList.push({noun:directObjectNoun,adjectivePhrase:directObject.adjectivePhrase})
            if (subjectNoun.startsWith("_")){wildcards.subject=0}
            if (directObjectNoun.startsWith("_")){wildcards.directObject=1}
        }

        if (!subjectNoun.startsWith("_"))
        {
            specificity[0]+=1
            nouns[subjectNoun]=reify.net[subjectNoun]
        }
        if (!directObjectNoun.startsWith("_"))
        {
            specificity[0]+=1
            nouns[directObjectNoun]=reify.net[directObjectNoun]
        }
        specificity[1]+=subject.adjectivePhrase?.specificity[1]??0
        specificity[1]+=directObject.adjectivePhrase?.specificity[1]??0
        
        predicate.prepositionalPhrases?.forEach((phrase,index)=>
        {
            let target=phrase.target.definition.key
            argumentList.push({noun:target})
            if (target.startsWith("_")){wildcards[target.slice(1,-1)]=index+2}
            else
            {
                specificity[0]+=1
                nouns[target]=reify.net[target]
            }

            specificity[1]+=target.adjectivePhrase?.specificity[1]??0
        })
        interpretation.gist={predicate:verb.predicate,tense:verb.tense,polarity:verb.polarity,arguments:argumentList,wildcards:wildcards,specificity:specificity,nouns:nouns}
        return true

    }})
reify.dsl.selection.predicate
    .snip("verb",reify.dsl.verb).snip("directObject",reify.dsl.nounPhrase).snip("prepositionalPhrases")
    .configure({semantics:interpretation=>
    {
        let gist =interpretation.gist
        let predicate=gist.verb.definition.predicate
        let prepositions=(gist.prepositionalPhrases??[]).map(preposition=>preposition.definition.key)
        if (prepositions.length !== predicate.prepositions.length) return false
        prepositions.forEach((preposition,index)=>{if(preposition!==predicate.prepositions[index]) return false})
        return true
    }})
    reify.dsl.selection.predicate.prepositionalPhrases
    .snip("preposition",reify.dsl.preposition).snip("target",reify.dsl.nounPhrase)
    .configure({minimum:0,maximum:Infinity,greedy:true})

reify.dsl.selections=reify.Rule()
    .snip("selection",reify.dsl.selection).snip("period")
    .configure({maximum:Infinity, semantics:interpretation=>
    {
        //interpretation.gist=interpretation.gist.reduce((a,b)=>a.concat(b.selection),[])
        let selections=interpretation.gist.map(a=>a.selection)
        let selector=(wildcards,placeholders)=>
        {
            const reality=new reify.Reality()
            
            //resolve wildcards and placeholders: _thing_, #thing
            /*      wildcards.npc={index:0,noun:true}
                    wildcards.thing={index:1,noun:true}
                    wildcards.action={predicate:true}
            */

            
            selections.forEach(selection=>
            {
                const r=new reify.Reality

                selection.arguments.forEach((argument,index)=>
                {
                    const noun=argument.noun
                    if (noun.startsWith("_"))
                    {

                        Object.assign(r.wildcards,{[noun.slice(1,-1 )]:{index:index,noun:true}})
                    }
                    else if (noun.startsWith("#")) 
                    {
                        
                        if (r.isEmpty) r.add(reify.net[placeholders[noun.slice(1)]]._indexes[index])
                        else r.filter(reify.net[placeholders[noun.slice(1)]]._indexes[index])

                    }
                    else
                    {

                        //get facts associated with noun._index[index] if reality is empty, add otherwise filter
                        if (r.isEmpty) r.add(reify.net[noun]._indexes[index])
                        else r.filter(reify.net[noun]._indexes[index])

                    }
                })
                // apply predicate to reality
                if (selection.predicate instanceof reify.classes.Predicate) selection.predicate._index
                else if (selection.predicate) wildcards[selection.predicate.slice(1,-1 )]={predicate:true} 
                // apply adjectives
                r.forEach(fact=>
                {
                    selection.arguments.forEach((argument)=>  
                    {
                        if (argument.filter && argument.filter(reify.net[argument.noun])) r.subtract(fact)
                    })

                })
                reality.add(r)
            })

            //DEFECT what do we do about negative polarity and tense?
            return reality
                
        } 
        let specificity=selections.reduce((a,b)=>
        {
            a[0]+=b.specificity[0]
            a[1]+=b.specificity[1]
            return a
        },[0,0])
        specificity=specificity.map(s=>s/selections.length) //DEFECt Averaging specificity isn't great.  
        interpretation.gist={selector:selector,specificity:specificity,
             nouns:selections.reduce((a,b)=>{Object.values(b.nouns).forEach(noun=>a.add(noun)); return a},new Set()),
             predicates:selections.reduce((a,b)=>a.add(b.predicate), new Set())}         
           // nouns:selections.reduce((a,b)=>Object.assign(a,b.nouns),{}),predicates:selections.map((selection)=>selection.predicate)}         
        return true
    }})
reify.dsl.selections.period.configure({regex:/^\./,lax:true})

reify.selectionParser=reify.Parser({ lexicon: reify.glossary, grammar: reify.dsl.selections,separator:/^[\s\,]+/ })


/*  condition grammar
    condition => term termOperations*
    termOperations=> orOperator term
    term => factor factorOperations*
    factorOperations=> andOperator factor
    factor => selection
    factor=>notOperator factor
    factor=>leftParen condition rightParen
*/

reify.dsl.condition=reify.Rule()
reify.dsl.condition.snip("term").snip("termOperations")
reify.dsl.condition.term.snip("factor").snip("factorOperations")
reify.dsl.condition.termOperations.snip("orOperator").snip("term",reify.dsl.condition.term)
    .configure({minimum:0,maximum:Infinity})
reify.dsl.condition.termOperations.orOperator.configure({filter:(definition)=>definition?.part==="orOperator"})
reify.dsl.condition.term.factorOperations.snip("andOperator").snip("term",reify.dsl.factor)
    .configure({minimum:0,maximum:Infinity})
reify.dsl.condition.term.factorOperations.andOperator.configure({filter:(definition)=>definition?.part==="andOperator"})
reify.dsl.condition.term.factor
    .snip(0,reify.dsl.selection)
    .snip(1)
    .snip(2)
reify.dsl.condition.term.factor[1].snip("notOperator").snip("factor",reify.dsl.condition.term.factor)
reify.dsl.condition.term.factor[1].notOperator.configure({filter:(definition)=>definition?.part==="notOperator"})
reify.dsl.condition.term.factor[2].snip("leftParen").snip("condition",reify.dsl.condition).snip("rightParen")
reify.dsl.condition.term.factor[2].leftParen.configure({regex:/^\(/})
reify.dsl.condition.term.factor[2].rightParen.configure({regex:/^\)/})

reify.conditionParser=reify.Parser({ lexicon: reify.glossary, grammar: reify.dsl.condition, boundary:/^[\(\)]/,separator:/^[\s\,]+/ })


reify.select=function(literals, ...expressions)
{
	var source=reify.toString(literals, ...expressions)
	
	let {success,interpretations}=reify.selectionParser.analyze(source)
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
           
            return interpretations[0].gist.selector()
		}
        
	}
	else
	{
		console.log(interpretations)

		throw new Error("ERROR 0005: Unable to parse reify source code.")

	}

}

reify.now=function(literals, ...expressions)
{
	let {success,interpretations}=reify.statementParser.analyze(reify.toString(literals, ...expressions))
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
                let reality=reify.Reality()
                interpretations[0].gist.forEach(statement=> reality.add(new reify.classes.fact(statement)))
                reality.forEach(fact=>
                {
                    

                })
            }
        }
        else
        {
            console.log(interpretations)
            throw new Error("ERROR 0005: Unable to parse reify source code.")
        }
        return this

}



// #region scene



reify.scene=function(literals, ...expressions)
{
   return new reify.classes.Scene(literals, ...expressions)
}





// #end region
// #region error messages
var errors=
{

}
// #end region



