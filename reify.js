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
	var {snippets:result}=this.grammar.parse(text,this.lexicon, this.separator, this.boundary)
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
			return {success:false, interpretations: partialInterpretations.sort(function(first,second){return first.remainder.length - second.remainder.length})}
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
reify.Rule.prototype.parse =function(text,lexicon,separator,boundary)
{
	var someText=text.slice(0)
	var results=[]
	var keys=Object.keys(this)
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

								var {snippets}=this[key].parse(remainder.slice(0),lexicon,separator,boundary) 
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
						})
						
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
						
						phrases=[]
					}
					counter++
					if (revisedCandidates.length===0)
					{
						break
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
									var {snippets}=this[key].parse(remainder.slice(0),lexicon,separator,boundary) 
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
								var {snippets}=this[key].parse(remainder.slice(0),lexicon,separator,boundary) 
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
					if (results.length>0){break} //found something that works, stop looking.
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
		return {snippets:results}	
	}
	else
	{
		return {snippets:[]}
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
// #region Phrase

reify.Phrase =class Phrase
{
	constructor(...precursor) 
	{
		Object.defineProperty(this,"id",{value:"",writable:true})
		Object.defineProperty(this,"echo",{value:false,writable:true})
		Object.defineProperty(this,"ended",{value:false,writable:true})
		Object.defineProperty(this,"_locked",{value:false,writable:true})
		Object.defineProperty(this,"_erasable",{value:false,writable:true})
		Object.defineProperty(this,"phrases",{value:[],writable:true})
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
		return new Proxy(this, reify.Phrase.__handler)
	}
	get also()  //Joins second phrase if first phrase generates non empty string
	{
		var primaryPhrase=this
		return new Proxy((...precursor) => new class alsoPhrase extends reify.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]=primaryPhrase
				this.phrases[1]=new reify.Phrase(...precursor)
				this.catalog()
			}
			generate()
			{
				var results=this.phrases[0].generate()
				if (results.length>1 || (results.length===1 && results[0].value!==""))
				{
					this.results=results.concat(this.phrases[1].generate())
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
		var primaryPhrase=this
		return new Proxy((...precursor) => new class whenPhrase extends reify.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]=primaryPhrase
				this.phrases[1]=new reify.Phrase(...precursor)
				this.catalog()
			}
			generate()
			{
				this.phrases[1].generate()
				if (this.phrases[1].text)
				{
					this.phrases[0].generate()
					this.text=this.phrases[0].text + this.phrases[1].text
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
	get _() //joins two phrases without space
	{
		var primaryPhrase=this
		return new Proxy((...precursor) => new class spacePhrase extends reify.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]=primaryPhrase
				this.phrases[1]=new reify.Phrase(...precursor)
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
	get spc()  //joins two phrases with space
	{
		var primaryPhrase=this
		return new Proxy((...precursor) => new class spcPhrase extends reify.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]=primaryPhrase
				this.phrases[1]=new reify.Phrase(...precursor)
				this.catalog()
			}
			generate()
			{
				var results1=this.phrases[0].generate()
				var results2=this.phrases[1].generate()
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
	get spc1()  //joins 2 phrases with space  if first phrase generates non-empty string. 
	{
		var primaryPhrase=this
		return new Proxy((...precursor) => new class spc1Phrase extends reify.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]=primaryPhrase
				this.phrases[1]=new reify.Phrase(...precursor)
				this.catalog()
			}
			generate()
			{
				var results1=this.phrases[0].generate()
				var results2=this.phrases[1].generate()
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
	get spc2()  //joins 2 phrases with space  if and only if both phrases generate non-empty strings. 
	{
		var primaryPhrase=this
		return new Proxy((...precursor) => new class spc2Phrase extends reify.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]=primaryPhrase
				this.phrases[1]=new reify.Phrase(...precursor)
				this.catalog()
			}
			generate()
			{
				var results1=this.phrases[0].generate()
				var results2=this.phrases[1].generate()
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
	get comma()  //joins two phrases with , or space
	{
		var primaryPhrase=this
		return new Proxy((...precursor) => new class spacePhrase extends reify.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]=primaryPhrase
				this.phrases[1]=new reify.Phrase(...precursor)
				this.catalog()
			}
			generate()
			{
				var results1=this.phrases[0].generate()
				var results2=this.phrases[1].generate()
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

	get comma2()  //joins two phrases with , or period
	{
		var primaryPhrase=this
		return new Proxy((...precursor) => new class spacePhrase extends reify.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]=primaryPhrase
				this.phrases[1]=new reify.Phrase(...precursor)
				this.catalog()
			}
			generate()
			{
				var results1=this.phrases[0].generate()
				var results2=this.phrases[1].generate()
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
		this.phrases.forEach(phrase=> 
		{
			if (phrase instanceof reify.Phrase )
			{
				var tags= phrase._catalogUp()  // recursive catalog for sub phrases
				Object.keys(tags).forEach(key=>
				{
					if(!this.tags[key])
					{
						this.tags[key]=tags[key] //add sub phrases to this's tags
					} 
				})
			}
		})
		return this.tags
	}
	_catalogDown()
	{
		this.phrases.forEach(phrase=>
		{
			if (phrase instanceof reify.Phrase)
			{
				Object.keys(this.tags).forEach(key=>
				{
					if (!phrase.tags[key])
					{
						phrase.tags[key]=this.tags[key]  //add selfs tags to sub phrases
					}	
					phrase._catalogDown()  //recursively
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
		return new class concurPhrase extends reify.Phrase
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
		return new class firstPhrase extends reify.Phrase
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
		erasures.forEach(erasure=>{if (this.tags[erasure]._erasable){this.tags[erasure].phrases=[]}})
		return this
	}
	generate(phrases=this.phrases)
	{
		this.results=[]
		phrases.forEach((phrase)=>
		{
			if (phrase.generate) 
			{
				this.results=this.results.concat(phrase.generate())
			}
			else
			{
				if(Object.getPrototypeOf(phrase)===Object.prototype)
				{
					if(phrase.hasOwnProperty("value"))
					{
						if (phrase.value.generate){this.results=this.results.concat(phrase.value.generate())}
						else{this.results=this.results.concat(phrase)}
					}
					else
					{
						var values=Object.values(phrase)
						if (values.length>0)
						{
							if (values[0].generate){this.results=this.results.concat(values[0].generate())}
							else{this.results.push(Object.assign({value:values[0]},phrase))}
						}
						else 
						{
							this.results.push({value:""})
						}
					}
				}
				else
				{
					this.results.push({value:phrase})
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
		if (this.phrases.length>0 && this.phrases[0] instanceof reify.Phrase)
		{
			return this.phrases[0]
		}
		else
		{
			return this
		}
	}
	join({separator=" ", trim=true}={})
	{
		return new class joinPhrase extends reify.Phrase
		{
			generate()
			{
				super.generate()
				var last=this.results.length-1
				this.text=this.results.map(item=>item.value).reduce((result,phrase,index,)=>result+phrase+((index===last && trim)?"":separator),"")	
				if (this.text){this.results=[{value:this.text}]}
				return this.results
			}
		}(this)
	}
	last(count=1)
	{
		return new class lastPhrase extends reify.Phrase
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
		var thisPhrase=this
		return new Proxy((precursor) => new class matchPhrase extends reify.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]=thisPhrase  //hobbies
				this.phrases[1]=precursor  //person
				this.catalog()
			}
			generate()
			{
				var a=this.phrases[0].generate()
				var b= this.phrases[1].generate()
				this.results=a.filter(a=>b.map(item=>item.value).includes(a.value))
				this.text=this.toString()
				return this.results
			}
		},reify.template.__handler)
	}
	//Unlike expand, modify takes a function to be applied to each of this phrases results.
	modify(modifier,...data)
	{
		if(data.length>0)
		{
			if(data.length===1 && data[0] instanceof reify.Phrase){var target=data[0]}
		}
		else {var target=this}
		return new class modifyPhrase extends reify.Phrase
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
					var modifiedPhrase=Object.assign({},item)
					return Object.assign(modifiedPhrase,{value:modifier(item)})
				})	
				this.text=this.toString()
				return this.results
			}
		}()
	}
	slot(rank)
	{
		return new class slotPhrase extends reify.Phrase
		{
			constructor(primaryPhrase)
			{
				super(primaryPhrase,rank)
				this.catalog()
			}
			generate()
			{
				super.generate()
				var rank=parseInt(this.phrases[1])
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
			if(data.length===1 && data[0] instanceof reify.Phrase){var target=data[0]}
		}
		else {var target=this}
	
		return new class transformPhrase extends reify.Phrase
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
		var primaryPhrase=this
		return new Proxy((...precursor) => new class perPhrase extends reify.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]=primaryPhrase
				if (precursor.length === 1 && precursor[0] instanceof reify.Phrase){this.phrases[1]=precursor[0]}
				else(this.phrases[1]= new reify.Phrase(...precursor))
				this.catalog()
				
			}
			generate()
			{
				this.results=[]
				for (let index = 0; index < this.phrases[1].generate().length; index++) {
					this.results=this.results.concat(this.phrases[0].generate())
				}
				this.text=this.toString()
				return this.results	
			}
		},reify.template.__handler)
	}
	//fill figures out the core phrase to fill
	//_fill formats data and assigns to phrases array.
	//DEFECT: Do we need to catalog after filling?
	fill(...items)
	{
		if (items.length===1 && Object.getPrototypeOf(items[0])===Object.prototype)  //Might be POJO destined for tagged phrases.
		{
			if (!items[0]._tagPhrase)
			{
				this.erase()
				Object.keys(items[0]).forEach(key=>
				{
					if (this.tags.hasOwnProperty(key))
					{
						this.tags[key].erasable=true
						this.tags[key].fill({_tagPhrase:true,_data:items[0][key]}) 
					}
				})
				//this.catalog()
				return this	
			}

		}
		if (this.phrases.length===1 && this.phrases[0] instanceof reify.Phrase)  //send items down to the core phrase
		{
			this.phrases[0].fill(...items)
			//this.catalog()
			return this	

		}
		//We're at the core so update phrase array with items.

		//this.erase()  //get rid of leftovers from last fill
		if(!(items[0]===undefined) && (Object.getPrototypeOf(items[0])===Object.prototype && items[0]?._tagPhrase))
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

		if (data.length===0){this.phrases=data}
		else
		{
			this.phrases=data.map(phrase=> //normalize phrases
			{
				//if (phrase===undefined || phrase === null){return ""}
				var phraseType=typeof phrase
				if(phraseType==="string" ||Object.getPrototypeOf(phrase)===Object.prototype || phrase.generate || phraseType==="function" )
				{return phrase}

				return phrase.toString()

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
		this.phrases.forEach(phrase=>
		{
			if(phrase instanceof reify.Phrase){phrase.reset()}	
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
		this.phrases.forEach(phrase=>
		{
			if(phrase instanceof reify.Phrase)
			{
				phrase.seed(reify.util.random(this._seed).seed)
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
		var primaryPhrase=this
		return new Proxy((...precursor) => new class thenPhrase extends reify.Phrase
		{
			constructor()
			{
				super()
				this.phrases[0]=primaryPhrase
				this.phrases[1]=new reify.Phrase(...precursor)
				this.catalog()
			}
			generate()
			{
				var results=this.phrases[0].generate()
				if (results.length>1 || (results.length===1 && results[0].value!==""))
				{
					this.results=results
					this.text=this.phrases[0].text
				}
				else
				{
					this.results=this.phrases[1].generate()
					this.text=this.phrases[1].text
				}
				return this.results
			}
		},reify.template.__handler)
	}
	

	//Unlike modify, expand takes a phrase factory and applies the results of this phrase to it.
	expand(phraseFactory)
	{
		var thisPhrase=this
		return new class expandPhrase extends reify.Phrase
		{
			generate()
			{
				this.results=thisPhrase.generate()
				this.text=this.toString()
				if (this.text)
				{
					if(this.results.length===1 && this.results[0].value instanceof Array)
					{
						this.results=phraseFactory(this.results[0].value).generate().map(item=>Object.assign({},item))	
					}
					else
					{
						this.results=phraseFactory(this.results).generate().map(item=>Object.assign({},item))
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
reify.Phrase.define=function(id)
{
	var as= (phraseFactory)=>
	{
		Object.defineProperty(reify.Phrase.prototype,id,
		{
			get()
			{
				return phraseFactory(this)
			}
		})
	}
	return {as:as}	
}
reify.Phrase.__handler=
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
				return new reify.Phrase(target).tag(property.toLowerCase())
			}
			else
			{
				if(target.constructor.name==="siblingPhrase"){return reify.template.child(target,property)}
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

	//if template[asFunction] is undefined, property refers to a tagged phrase.
	get:function(template, property,receiver)
	{
		//template is function that returns a phrase
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
		if (property.toUpperCase()===property)  //property is request to create a tagged phrase
		{
			var finalPhraseFactory=(...precursor)=>template(new reify.Phrase(...precursor).tag(property.toLowerCase()))
			var priorPhraseFactory=(...precursor)=> new reify.Phrase(...precursor).tag(property.toLowerCase())
			var handler=Object.assign(
				{
					wrapper:template,
					prior:priorPhraseFactory,
					sibling:true //next property request for sibling
				},
				reify.template.__handler	
			)
			return new Proxy(finalPhraseFactory,handler)
		}
		if (this.sibling)  //property is request for sibling phrase
		{
			var finalPhraseFactory=()=>this.wrapper(reify.template.sibling(this.prior(),property))
			var priorPhraseFactory=()=>reify.template.sibling(this.prior(),property)
			var handler=Object.assign(
				{
					wrapper:this.wrapper,
					prior:priorPhraseFactory,
					child:true  //next property request is for child
				},
				reify.template.__handler	
			)
			return new Proxy(finalPhraseFactory,handler)			

		}
		if (this.child)
		{
			var finalPhraseFactory=()=>this.wrapper(reify.template.child(this.prior(),property))
			var priorPhraseFactory=()=>reify.template.child(this.prior(),property)
			var handler=Object.assign(
				{
					wrapper:this.wrapper,
					prior:priorPhraseFactory,
					child:true  //all future property request are for children
				},
				reify.template.__handler	
			)
			return new Proxy(finalPhraseFactory,handler)	
		}
		//property is neither request for child nor sibling; must be echo phrase
		var finalPhraseFactory=()=>template(reify.template.echo(property))
		var priorPhraseFactory=()=>reify.template.echo(property)
		var handler=Object.assign(
			{
				wrapper:template,
				prior:priorPhraseFactory,
				sibling:true //next property request for sibling
			},
			reify.template.__handler	
		)
		return new Proxy(finalPhraseFactory,handler)
	}
}

reify.template.defineClass=function(id)
{
	var as= (phraseClass)=>
	{
		reify.template[id]=new Proxy((...precursor)=>new phraseClass(...precursor),reify.template.__handler)
	}
	return {as:as}	
}
reify.template.define=function(id)
{
	var as= (phraseFactory)=>
	{
		reify.template[id]=new Proxy(phraseFactory,reify.template.__handler)
	}
	return {as:as}	
}
reify.template._=new Proxy
(
	function _(...data)
	{
		if (data.length===1 && data[0] instanceof reify.Phrase) return data[0]
		else return new reify.Phrase(...data)
	}
	,reify.template.__handler
)
reify.template.define("cycle").as((...data)=>
{
	var counter=0
	return new class cyclePhrase extends reify.Phrase
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
			if (this.phrases.length===1 && this.phrases[0] instanceof reify.Phrase)
			{
				results=super.generate()
				var total=this.results.length
				results=results.slice(counter,counter+1)
			}
			else
			{
				var results=super.generate(this.phrases.slice(counter,counter+1))
				var total=this.phrases.length
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
	return new class echoPhrase extends reify.Phrase
	{
		constructor()
		{
			super()
			if (tag instanceof reify.Phrase){this.phrases[0]=tag}
			this.echo=true
		}
		generate()
		{
			if (this.phrases.length===0){this.phrases[0]=this.tags[tag]}

			if (this.echo){this.results=this.phrases[0].results}
			else{this.results=this.phrases[0].generate()}
			this.text=this.toString()
		//	this.tally=this.phrases[0].value.tally
			return this.results
		}
		get inner()
		{
			if (this.phrases.length===0){var innerPhrase= echo(this.tags[tag].inner)}
			else {var innerPhrase= echo(this.phrases[0].inner)}
			innerPhrase.echo=this.echo
			return innerPhrase
		}
		get results()
		{
			if (this.phrases.length===0){tag.results}
			else {return super.results}
		}
		set results(value){this._results=value}
	}()		
}
//_.blah.echo.data.data
//_blah.data.data

reify.template.sibling=function sibling(phrase, property)
{
	return new class siblingPhrase extends reify.Phrase
	{
		constructor()
		{
			super()
			this.phrases[0]=phrase
		}
		generate()
		{
			this.results=this.phrases[0].generate()
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
			//this.tally=this.phrases[0].value.tally
			return this.results
		}
	}()		
}
reify.template.define("child").as(function child(parent,property)
{
	return new class childPhrase extends reify.Phrase
	{
		constructor()
		{
			super()
			this.phrases[0]=parent
		}
		generate()
		{
			this.results=this.phrases[0].generate()
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
			//this.tally=this.phrases[0].value.tally
			return this.results
		}
	}()		
})
reify.template.define("ante").as(function ante(outer)
{
	return new class antePhrase extends reify.Phrase
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
			while (target.constructor.name === "antePhrase")
			{
				counter++
				target=target.phrases[0] //.value
			}
			for (let i = 0; i <counter; i++)
			{
				target=target.inner
			}	
			return target
		}
	}()		
})

reify.template.defineClass("favor").as( class favorPhrase extends reify.Phrase
{
	generate()
	{
		if(this.phrases.length===0)
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
			
			if (this.phrases.length===1 && this.phrases[0] instanceof reify.Phrase)
			{
				var results=super.generate()
				var total=results.length
				var c=total*(total+1)*random
				var counter=total-Math.floor((Math.sqrt(1+4*c)-1)/2)-1
				results=results.slice(counter,counter+1)
			}
			else
			{
				var total=this.phrases.length
				var c=total*(total+1)*random
				var counter=total-Math.floor((Math.sqrt(1+4*c)-1)/2)-1
				var results=super.generate(this.phrases.slice(counter,counter+1))
			}

			results.forEach(phrase=>
			{
				phrase.index=counter
				phrase.rank=counter+1
				phrase.total=total
			})
			this.results=results
			return this.results
		}
	}
	
})
reify.template.define("pick").as((...data)=>
{
	var previous
	return new class pickPhrase extends reify.Phrase
	{
		generate()
		{
			if(this.phrases.length===0)
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
				if (this.phrases.length===1 && this.phrases[0] instanceof reify.Phrase)
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
					var total=this.phrases.length
					var counter=Math.floor(random*total)
					if (counter===previous){counter =(counter+1)%total}
					previous=counter
					var results=super.generate(this.phrases.slice(counter,counter+1))
				}

				results.forEach(phrase=>
				{
					phrase.index=counter
					phrase.rank=counter+1
					phrase.total=total
				})
				this.results=results
				return this.results
			}
		}
	}(...data)
})
reify.template.define("re").as((phrase)=>
{
	phrase.re=true
	return phrase
})

reify.template.define("cull").as((...precursor)=>
{
	return new class cullPhrase extends reify.Phrase
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
	return new class refreshPhrase extends reify.Phrase
	{
		generate()
		{
			this.reset()
			super.generate()
			return this.results
		}
	}(...precursor)
})
reify.template.defineClass("roll").as( class rollPhrase extends reify.Phrase
{
	generate()
	{
		if(this.phrases.length===0)
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
			if (this.phrases.length===1 && this.phrases[0] instanceof reify.Phrase)
			{
				var results=super.generate()
				var total=results.length
				var counter=Math.floor(random*total)
				results=results.slice(counter,counter+1)
			}
			else
			{
				var total=this.phrases.length
				var counter=Math.floor(random*total)
				var results=super.generate(this.phrases.slice(counter,counter+1))
			}

			results.forEach(phrase=>
			{
				phrase.index=counter
				phrase.rank=counter+1
				phrase.total=total
			})
			this.results=results
			return this.results
		}
	}
})
reify.template.define("series").as((...data)=>
{
	var counter=0
	return new class seriesPhrase extends reify.Phrase
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
			if (this.phrases.length===1 && this.phrases[0] instanceof reify.Phrase)
			{
				var results=super.generate()
				var total=results.length
				results=results.slice(counter,counter+1)
			}
			else
			{
				var results=super.generate(this.phrases.slice(counter,counter+1))
				var total=this.phrases.length
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
	return new class shufflePhrase extends reify.Phrase
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
	return new class pinPhrase extends reify.Phrase
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
	return new class spacePhrase extends reify.Phrase
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
				reify.glossary.register(adjective).as({part: "adjective",key:property, value:noun=>{
                    if (noun[property]===index) return index
                    else return false
                }})
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
reify.facts=new Proxy 
(
	class Fact
	{
		constructor(literals, ...expressions)
            //statement={tense:0,mood:0,voice:0,polarity:0}) //reify.fact({predicate:{},tense:1,mood:0,voice:0,polarity:0,arguments:{subject:{},carry:{}},nouns:[]}
		{
            var source=reify.toString(literals, ...expressions)
            let {success,interpretations}=reify.dslParser.analyze(source)
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
                        statement.arguments.forEach(argument=>
                            {if (argument.value.noun.startsWith("#")) argument.value.noun=argument.value.noun.slice(1,-1)})
                        statement.valid=true
                        statement.arguments.forEach(argument=>argument.value.adjectives.forEach(adjective=>
                        {
                            if (adjective.value(reify.net[argument.value.noun])===false) statement.valid=false
                        }))


                        statement=statement.predicate.induce(statement)  

                        let keys=statement.arguments.map(argument=>argument.key)
                        statement.nouns=statement.arguments.map(argument=>reify.net[argument.value.noun]?reify.net[argument.value.noun]:reify.noun(argument.value.noun))
                        /*removed passive voice from the spec.
                        //statements may use passive voice, but facts are always active voice. Swap subject and direct object if statement is passive.
                        if (statement.voice===reify.lang.passive)[statement.nouns[0], statement.nouns[1]] = [statement.nouns[1],statement.nouns[0]]
                        */

                        let id=statement.nouns[0].id //+"_"+fact.predicate.verb
                        for (let index = 1; index < keys.length; index++) {id=id+"_"+keys[index]+"_"+statement.nouns[index].id}
                        let fact=reify.net[id]

                        if (fact) //update existing fact.
                        {
                            history[reify.turn]={clock:reify.clock,tense:fact.tense,mood:fact.mood,polarity:fact.polarity }
                            fact.tense=statement.tense
                            fact.mood=statement.mood
                            fact.polarity=statement.polarity
                        }
                        else
                        {
                            // statement.arguments=statement.arguments.reduce((a, b,index)=>Object.assign(a,{[b.key]:statement.nouns[index]}),{}) //subject:"player" to subject:player
                            Object.defineProperty(this, "id",{value:id,enumerable:false})
                            Object.defineProperty(this, "predicate",{value:statement.predicate,enumerable:false})
                            Object.defineProperty(this, "tense",{value:statement.tense,enumerable:false})
                            Object.defineProperty(this, "mood",{value:statement.mood,enumerable:false})
                            //Object.defineProperty(this, "voice",{value:statement.voice,enumerable:false})  //all facts in network are active voice
                            Object.defineProperty(this, "polarity",{value:statement.polarity,enumerable:false})
                            Object.defineProperty(this, "nouns",{value:statement.nouns,enumerable:false})
                            Object.defineProperty(this, "history",{value:[],enumerable:false})
                            // Object.assign(this,statement.arguments)
                            this.history[reify.turn]={clock:reify.clock,tense:this.tense,mood:this.mood,polarity:this.polarity }


                            reify.net[id]=this
                            fact= this
                        }

                        fact.nouns.forEach((noun,index)=>
                            {
                                let i=noun._indexes
                                if (i[index] instanceof reify.Reality) i[index].add(fact)
                                else i[index]=new reify.Reality(fact)
                            })
                        fact.predicate._index.add(fact)
                        return fact
                    })
                }
            }
            else
            {
                console.log(interpretations)
                throw new Error("ERROR 0005: Unable to parse reify source code.")

            }


			

		}

		get prepositions(){return Object.keys(this).slice(2)}
		get verb(){return Object.keys(this)[1]}

	},
	reify.proxies.newless
)
reify.fact=reify.facts //fact is a synonym for facts

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
reify.noun=new Proxy
(
	class Noun
	{
		constructor(literals, ...expressions) // maybe template literal notation or function notation
		{
            
			Object.defineProperty(this, "id",{value:reify.formatId(reify.toString(literals, ...expressions)),enumerable:false})
			Object.defineProperty(this, "description",{value:reify.template._,enumerable:false,writable:true})
			Object.defineProperty(this, "name",{value:reify.formatName(this.id),enumerable:false,writable:true})
            Object.defineProperty(this, "attributive",{value:false,enumerable:false,writable:true})
            Object.defineProperty(this, "_indexes",{value:[],enumerable:false,writable:true})
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

	},
	reify.proxies.newless	
)
// #endregion

// #region predicate

//predicate`connect to on north`.adverb`one-way`.reify(reality=>reality).select(reality||nounList=>reality).check(reality||nounList=>proposition)

//oak door connects bar to foyer on north.  
//adverbs supply hints for processing reify and select
//magic portal connects bar to foyer on north one-way. -- adverbs may appear at end
//magic portal one-way connects bar to foyer on north. -- adverbs may appear before verb
//twisty passage one-way connects bar to foyer on north. twisty passage one-way connects foyer to bar on east. 

//reify.lang.es("verb") --third person present tense: she leaps.

reify.classes.Predicate=class Predicate
{
	constructor(literals, ...expressions) // maybe template literal notation or function notation
	{
		let name=reify.toString(literals, ...expressions)
		let p_strings=name.split(" ")
		Object.defineProperty(this, "id",{value:reify.formatId(name),enumerable:false})
		//Object.defineProperty(this, "name",{value:reify.formatName(this.id),enumerable:false,writable:true})
		Object.defineProperty(this, "verb",{value:reify.formatName(p_strings[0]),enumerable:false,writable:false})
		Object.defineProperty(this, "prepositions",{value:p_strings.splice(1),enumerable:false,writable:false})
		Object.defineProperty(this, "mutual",{value:false,enumerable:false})
		Object.defineProperty(this, "exclusive",{value:false,enumerable:false})
		Object.defineProperty(this, "_index",{value:new reify.Reality(),enumerable:false,writable:true})

		reify.lang.conjugatePredicate(this)
		this.prepositions.forEach(preposition=>
		{
			reify.glossary.register(preposition).as({part:"preposition", key:preposition, predicate:this})
		})	
		return new Proxy(this,reify.proxies.predicate)		
	}

	adverb(literals, ...expressions)
	{
		reify.glossary.register(reify.toString(literals, ...expressions)).as({part: "adverb",  predicate:this})
		return this

	}
	aka(literals, ...expressions)
	{
		let verb=reify.toString(literals, ...expressions)
		reify.lang.conjugate(verb,"active","affirmative")
			.concat(reify.lang.conjugate(verb,"active","negative"))
			.forEach(conjugation=>
			{
				let name=conjugation.name
				delete conjugation.name
				conjugation.predicate=this
				reify.glossary.register(name).as(conjugation)
			})
            reify.adjective(reify.lang.ing(verb)).describes(noun=>noun._indexes[0].filter(this._index).size>0)
            reify.adjective(reify.lang.ed(verb)).describes(noun=>noun._indexes[1].filter(this._index).size>0)
		return this
	}
	check(reality)
	{
		//TO DO: use reality to find facts in reify.net that match 

		if (reality.size>0) return true
		return false
	}
	/*  //Can we get away with no passive voice for the DSL?
    passive(literals, ...expressions)
	{
		let verb=reify.toString(literals, ...expressions)
		reify.lang.conjugate(verb,"passive","affirmative")
			.concat(reify.lang.conjugate(verb,"passive","negative"))
			.forEach(conjugation=>
			{
				let name=conjugation.name
				delete conjugation.name
				conjugation.predicate=this
				reify.glossary.register(name).as(conjugation)
			})
	}
    */
	induce(statement) //{predicate, tense, mood, voice, polarity, arguments, nouns}
	{
        //induce is used for supplementary facts associated with the statement
        //set statement.valid=false if supplementary facts replace are meant to replace fact generated from statement
        //reify.fact`implied fact`
        //reify.fact`implied fact`
    

        return statement

	}
	select(reality)
	{
		//filter reality by predicate. Typically overridden for virtual predicates
        if (reality.isEmpty) reality.concat(this._index)
        else reality.filter(this._index)
		return reality
	}
}
reify.proxies.predicate=
{	
	//use setter/getter for properties
	//predicate.property() returns value of property predicate.property(value) sets property with value
	get: function(target, property, receiver) //receiver is proxy.
	{
		if (typeof target[property] === "function" || property==="id") return target[property]
		return function(value)
		{
			if (value===undefined){return target[property]}
			target[property]=value
			return receiver
		}
	}	
}

reify.predicate=new Proxy(reify.classes.Predicate,reify.proxies.newless)
// #endregion

// #region reality
reify.Reality=new Proxy
(
	class Reality 
	{
		
		constructor(...facts)  //Realities can be made from facts or other realities
		{
			Object.defineProperty(this, "placeholder",{value:{},enumerable:false,writable:true})
			Object.defineProperty(this, "set",{value:new Set(),enumerable:false,writable:true})
            facts.forEach(fact=>
            {
                if (fact instanceof reify.Reality) this.set=this.set.union(fact.set)
                else if (fact instanceof reify.fact) this.set.add(fact)

            })
            return this

		}
		add(...items)
		{
			items.forEach(item=>
			{
				if (item instanceof reify.fact)  this.set.add(item)
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
            if (item instanceof reify.fact)  this.set.delete(item)
			else if (item instanceof reify.Reality) this.set=this.set.intersection(item)
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
	},reify.proxies.newless
)
// #endregion

// #region dsl


/* 



Test:
player carries ring that is owned by smeagle.
player carries ring that is owned by smeagle and that is liked by sarah.
a rich person, _the_ring_bearer_, carries the ring that is owned by _someone_.
_the_ring_bearer_ carries the ring that is owned by _someone_.  //acceptable but wordy
_the_ring_bearer_ carries the owned ring.  //more concise
_the_ring_bearer_, a person, carries the ring. 
_the_ring_bearer_, a person, carries an _item_ of jewelry .

A wildcard is used for matching in select statements.  A #placeholder# is used for creating nouns on the fly.

oak door connects bar to foyer on north.  -- implies abuttal implies reciprocal connection foyer to bar on south
exit connects bar to foyer on north. -- generic exit.
magic portal one-way connects bar to foyer on north. -- one-way adverb suppresses abuttal and reciprocal connection.
twisty passage one-way connects bar to foyer on north. twisty passage one-way connects foyer to bar on east.  --two-way connection without reciprocity and abuttal.
chute one-way connects bar to foyer.  bar abuts foyer on bottom

to do: do we need conditionals or is filter enough? Scenes are if statements maybe just need to AND to coordinating facts?
to do: should facts be added to the lexicon? part=fact


logic:

exp→term {OR term};

term→factor {AND factor};

factor→id;

factor→NOT factor;

factor→LPAREN exp RPAREN;

Left recursion, A=>Aa|b, is equivalent to right recursive

A=>Aa|b //left recursive 

//right recursive
A=>b C? 
C=>a C 

subject =>  subject predicate | nounPhrase // left recursive

subject => nounPhrase f
f =>

subject => nounPhrase subjectPrime
subjectPrime =>predicate subjectPrime?







EBNF:
    statements=>statement+
	statement=>statement period
    statement=>subject predicate 
	subject=>statement|nounPhrase
	predicate=>verb directObject prepositionalPhrase*
    prepositionalPhrase=>preposition target
    directObject=>statement|nounPhrase
    target=>statement|nounPhrase
    nounPhrase=>article? adjectives* noun restriction
    restriction=>appositive|relative|appositive comma relative
    appositive=>comma article? noun
    relative=>relativizer predicate
	noun=>lexiconNoun|wildcard|placeholder
	wildcard=>/^_[a-zA-Z]\w*[a-zA-Z _]_/
	placeholder=>/^#[a-zA-Z]\w*[a-zA-Z _]#/
    period=/^\./
    comma=/^\,/

EBNF:
    statements=>statement+
	statement=>statement period
    statement=>subject predicate 
	subject=>nounClause
   
	predicate=>verb directObject prepositionalPhrase*
    prepositionalPhrase=>preposition target
    directObject=>nounClause
    target=>nounClause
    nounClause=>nounPhrase gerundPhrase?
    gerundPhrase=>gerund directObject prepositionalPhrase*
    nounPhrase=>article? adjectives* attributive? noun relativeClause*
    relativeClause=>relativizer predicate
	noun=>lexiconNoun|wildcard|placeholder
	wildcard=>/^_[a-zA-Z]\w*[a-zA-Z _]_/
	placeholder=>/^#[a-zA-Z]\w*[a-zA-Z _]#/
    period=/^\./


Tests:

player carries ring. 

player carries ring that is owned by smeagle.
    subject predicate
    nounPhrase(player) verb(carries) directObject(ring that is owned by smeagle)
    nounPhrase(player) verb(carries) nounPhrase(ring that is owned by smeagle)
    nounPhrase(ring that is owned by smeagle)=>noun(ring) relativize(that) predicate(is owned by smeagle)


player carries ring that is owned by smeagle and that is liked by sarah.
    to do: logic parser

a rich person, _the_ring_bearer_, carries the ring that is owned by _someone_.
    article(a) adjective (rich) adjective(person) noun(_the_ring_bearer), verb(carries) nounPhrase(ring that is owned by smeagle)

_the_ring_bearer_ carries the ring that is owned by _someone_.  //acceptable but wordy.  Makes [someone] available for use.
_the_ring_bearer_ carries the owned ring.  //more concise



Bob carries the ring. => bob,carry,ring

Alice knows bob is carrying the ring. => alice, know, (bob, carry ring) need to implement "is verbing"
Wrong: alice knows bob carries the ring. //Should this be allowed when the fact is the indirect object?  alice, know, (bob, carry ring)
=>subject predicate

predicate=>verb directObject
directObject=>nounClause
nounClause=>subject predicate direct Object


Wrong: alice knows that bob carries the ring. //looks too much like restrictive clause











Bob carrying the ring endangers Charles. => 
    subject=>gerundPhrase
    gerundPhrase=>nounPhrase gerund gerundComplement


Bob carrying the ring compromises Della working on the project. 
subject=>gerundPhrase
object=>gerundPhrase


_someone_, who is a person and who wears a hat, carrying the ring endangers Charles.
    matches fact: (Bob~carries~ring)~endangers~charles
_someone_ who is a person and who wears a hat and who carries the ring endangers Charles.
    matches fact: Bob~endangers~charles

//player carries ring.
//player does not carry ring.
//some people carry treasure chest.
//some people do not carry treasure chest.
//player carried ring.
//player did not carry ring.
//the player carrying the ring endangers the plan.
//the player not carrying the ring endangers the plan.
//the player having carried the ring endangers the plan.
//the player having not carried the ring endangers the plan.
//the carried ring endangers the plan.
//the carrying player endangers the plan.





EBNF:
    statements=>statement+
	statement=>statement period
    statement=>subject predicate 
	subject=>nounClause
    nounClause=>nounPhrase gerundPhrase?
    gerundPhrase=>gerund directObject prepositionalPhrase*
    nounPhrase=>article? adjectives* attributive? noun relativeClause*
    relativeClause=>relativizer predicate
	noun=>lexiconNoun|wildcard|placeholder
	wildcard=>/^_[a-zA-Z]\w*[a-zA-Z _]_/
	placeholder=>/^#[a-zA-Z]\w*[a-zA-Z _]#/
    
    predicate=>verb directObject prepositionalPhrase*
    prepositionalPhrase=>preposition target
    directObject=>nounClause
    target=>nounClause

    period=/^\./
   
*/

reify.dsl={}
let dsl=reify.dsl
dsl.predicate=reify.Rule()

dsl.nounClause=reify.Rule()
    .snip("nounPhrase").snip("gerundPhrase")

dsl.nounClause.nounPhrase
    .snip("article",reify.dsl.article).snip("adjectives").snip("attributive").snip("noun",reify.dsl.noun).snip("relativeClause") 
    .configure({semantics:interpretation=>
    {
        const definition=interpretation.gist.noun.definition
        const key=definition.key??definition.match
        const adjectives=interpretation.gist.adjectives?.map(adjective=>adjective.definition) ?? []
        interpretation.gist={adjectives:adjectives, noun:key}

        return true
    }})
dsl.nounClause.nounPhrase.article.configure({minimum:0,filter:(definition)=>definition?.part==="article"})    
dsl.nounClause.nounPhrase.adjectives.configure({minimum:0,maximum:Infinity,filter:(definition)=>definition?.part==="adjective"})
dsl.nounClause.nounPhrase.attributive.configure({minimum:0,filter:(definition)=>definition?.part==="attributive"})
dsl.nounClause.nounPhrase.noun=reify.Rule().configure({mode:reify.Rule.apt})
	.snip(0)
	.snip(1,reify.dsl.placeholder)
	.snip(2,reify.dsl.wildcard)
dsl.nounClause.nounPhrase.noun[0]
    .configure({filter:(definition)=>definition?.part==="noun"})	
dsl.nounClause.nounPhrase.noun[1].configure({regex:/^#[a-zA-Z][\w ]*#/})
dsl.nounClause.nounPhrase.noun[2].configure({regex:/^\_[a-zA-Z][\w ]*\_/})

dsl.nounClause.nounPhrase.relativeClause
    .snip("relativizer").snip("predicate",dsl.predicate)
    .configure({minimum:0})
dsl.nounClause.nounPhrase.relativeClause.relativizer.configure({filter:(definition)=>definition?.part==="relativizer"})


dsl.prepositionalPhrases=reify.Rule()
	.snip("preposition").snip("target",dsl.nounClause)
    .configure({minimum:0,maximum:Infinity,greedy:true})
dsl.prepositionalPhrases.preposition.configure({filter:(definition)=>definition?.part==="preposition"})


dsl.nounClause.gerundPhrase
    .snip("gerund").snip("directObject",dsl.nounClause).snip("prepositionalPhrases",dsl.prepositionalPhrases)
    .configure({minimum:0})
dsl.nounClause.gerundPhrase.gerund.configure({filter:(definition)=>definition?.part==="gerund"})

dsl.statements=reify.Rule()
    .snip("statement").snip("period")
    .configure({maximum:Infinity, semantics:interpretation=>
    {
        interpretation.gist=interpretation.gist.reduce((a,b)=>a.concat(b.statement),[])
        return true
    }})
dsl.statements.statement
    .snip("subject",reify.dsl.nounClause).snip("predicate",dsl.predicate)
    .configure({semantics:interpretation=> //Due to wildcards, each statement may involve multiple facts.  
    {
        let verb=interpretation.gist.predicate.verb.definition
        let argumentList=[]

        argumentList.push({key:"subject", value:interpretation.gist.subject},{key:verb.predicate.verb,value:interpretation.gist.predicate.directObject})
        interpretation.gist.predicate.prepositionalPhrases?.forEach(phrase=>argumentList.push({key:phrase.preposition.definition.key,value:phrase.target}))

        interpretation.gist={predicate:verb.predicate,tense:verb.tense,mood:verb.mood,voice:verb.voice,polarity:verb.polarity,arguments:argumentList}
        return true

    }})
dsl.predicate
    .snip("verb").snip("directObject",dsl.nounClause).snip("prepositionalPhrases",dsl.prepositionalPhrases)
dsl.predicate.verb.configure({filter:(definition)=>definition?.part==="verb"})


dsl.statements.period.configure({regex:/^\./})

reify.dslParser=reify.Parser({ lexicon: reify.glossary, grammar: reify.dsl.statements, boundary:/^[\.]/,separator:/[\s\,]+/ })


reify.select=function(literals, ...expressions)
{
	var source=reify.toString(literals, ...expressions)
	
	let {success,interpretations}=reify.dslParser.analyze(source)
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
            const reality=new reify.Reality()
            const placeholder={}
            const statement=interpretations[0].gist[0]
            const predicate=statement.predicate
            /* Can we get away with no passive voice
            //statements maybe in active or passive voice, but facts are always in active voice.
            if (statement.voice===reify.lang.passive)[statement.nouns[0], statement.nouns[1]] = [statement.nouns[1],statement.nouns[0]]
            */
            statement.voice===reify.lang.active
            statement.arguments.forEach((argument,index)=>
            {
                const noun=argument.value.noun
                if (noun.startsWith("_")) Object.assign(reality.placeholder,{[noun.slice(1,-1 )]:{index:index,noun:true}})
                else
                {
                    //get facts associated with noun._index[index] if reality is empty, add otherwise filter
                    if (reality.isEmpty) reality.add(reify.net[noun]._indexes[index])
                    else reality.filter(reify.net[noun]._indexes[index])
                }
            })

            // apply predicate to reality
            if (predicate instanceof reify.classes.Predicate) predicate.select(reality)
            else if (predicate) placeholder[predicate.slice(1,-1 )]={predicate:true}

            // apply adjectives
            reality.forEach(fact=>
            {
                statement.arguments.forEach((argument,index)=>argument.value.adjectives.forEach(adjective=>
                {
                    if (adjective.value(fact.nouns[index])===false) reality.subtract(fact)
                }))

            })
            return reality
		}
	}
	else
	{
		console.log(interpretations)
		throw new Error("ERROR 0005: Unable to parse reify source code.")

	}

}

reify.dslParser=reify.Parser({ lexicon: reify.glossary, grammar: reify.dsl.statements})


reify.select=function(literals, ...expressions)
{
	var source=reify.toString(literals, ...expressions)
	
	let {success,interpretations}=reify.dslParser.analyze(source)
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
            const reality=new reify.Reality()
            const placeholder={}
            const statement=interpretations[0].gist[0]
            const predicate=statement.predicate
            /* Can we get away with no passive voice in DSL?
            //statements maybe in active or passive voice, but facts are always in active voice.
            if (statement.voice===reify.lang.passive)[statement.nouns[0], statement.nouns[1]] = [statement.nouns[1],statement.nouns[0]]
            */
            statement.voice===reify.lang.active
            statement.arguments.forEach((argument,index)=>
            {
                const noun=argument.value.noun
                if (noun.startsWith("_")) Object.assign(reality.placeholder,{[noun.slice(1,-1 )]:{index:index,noun:true}})
                else
                {
                    //get facts associated with noun._index[index] if reality is empty, add otherwise filter
                    if (reality.isEmpty) reality.add(reify.net[noun]._indexes[index])
                    else reality.filter(reify.net[noun]._indexes[index])
                }
            })

            // apply predicate to reality
            if (predicate instanceof reify.classes.Predicate) predicate.select(reality)
            else if (predicate) placeholder[predicate.slice(1,-1 )]={predicate:true}

            // apply adjectives
            reality.forEach(fact=>
            {
                statement.arguments.forEach((argument,index)=>argument.value.adjectives.forEach(adjective=>
                {
                    if (adjective.value(fact.nouns[index])===false) reality.subtract(fact)
                }))

            })
            return reality
		}
	}
	else
	{
		console.log(interpretations)
		throw new Error("ERROR 0005: Unable to parse reify source code.")

	}

}

// #region plot

reify.plot={}

reify.storyline=function()  //triggers upon fact creations
{

}



// #end region
// #region error messages
var errors=
{

}
// #end region
