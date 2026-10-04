"use strict"
/*
ISC License

Copyright 2026, Jennifer L Schmidt "bikibird"

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

https://reify-fiction.org

@bikibird
*/

const reify =function reify(literals, ...expressions) {return new reify.classes.entity(literals,...expressions)}
reify.classes={}
reify.past=0 //I ATE
reify.present=1 //I EAT
reify.progressive=2 //I AM EATING
reify.future=3 //I WILL EAT
reify.perfect=4 //I HAVE EATEN

reify.tense=reify.past

reify.affirmative=0
reify.negative=1


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
// #region Syntax
reify.Syntax=function Syntax() 
{
	if (this instanceof reify.Syntax)
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
		Object.defineProperty(this, "mode", {value:reify.Syntax.all, writable: true})
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
		return new Syntax()
	}
}
reify.Syntax.all=Symbol('all')
reify.Syntax.any=Symbol('any')
reify.Syntax.apt= Symbol('apt')
reify.Syntax.prototype.clone =function()
{
	var circularReferences=new Set()

	function _clone(rule)
	{
		var clonedSyntax= new reify.Syntax().configure({caseSensitive:rule.caseSensitive, entire:rule.entire, filter:rule.filter, full:rule.full, greedy:rule.greedy, keep:rule.keep,longest:rule.lax,longest:rule.longest, minimum:rule.minimum, maximum:rule.maximum, mode:rule.mode, mismatch:rule.mismatch, prefer:rule.prefer, regex:rule.regex, semantics:rule.semantics, separator:rule.separator, boundary:rule.boundary})
		var entries=Object.entries(rule)
		entries.forEach(([key,value])=>
		{
			if (circularReferences.has(value))
			{
				clonedSyntax[key]=value
			}
			else
			{
				circularReferences.add(value)
				clonedSyntax[key]=_clone(value)
			}
			
		})
		return clonedSyntax
	}	
	return _clone(this)
}	
reify.Syntax.prototype.configure =function({caseSensitive, entire, filter, full, greedy, keep, longest, lax, minimum,maximum, mode,mismatch,prefer, regex, semantics, separator,boundary}={})
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
reify.Syntax.prototype.parse =function(text,lexicon,errors,separator,boundary)
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
			case reify.Syntax.all:
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
			case reify.Syntax.any:
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
			case reify.Syntax.apt:
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
reify.Syntax.prototype.snip =function(key,rule)
{
	
	if (rule instanceof reify.Syntax)
	{
		this[key]=rule
	}
	else
	{
		this[key]=new reify.Syntax(key)

		this[key].caseSensitive=this.caseSensitive
		this[key].full=this.full
		this[key].longest=this.longest
		this[key].separator=this.separator
		
	}	
	return this		
}
// #endregion
// #region Passage
reify.classes.Passage =class Passage
{
	constructor(literals,...expressions) 
	{
		Object.defineProperty(this,"id",{value:"",writable:true})
        Object.defineProperty(this,"scene",{value:null,writable:true})
        Object.defineProperty(this,"mise",{value:false,writable:true})
		Object.defineProperty(this,"prefix",{value:[],writable:true})
		Object.defineProperty(this,"passages",{value:[],writable:true})
		Object.defineProperty(this,"results",{value:[],writable:true})
		Object.defineProperty(this,"_seed",{value:reify.util.random().seed,writable:true})
        Object.defineProperty(this,"suffix",{value:[],writable:true})
		Object.defineProperty(this,"text",{value:"",writable:true})
		this.fill(literals,...expressions)

		return this
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
    //fill figures out the core passage to fill
	//_fill formats data and assigns to passages array.
    fill(literals, ...expressions)
	{
     //   let literals=items[0]
      //  let expressions=items.slice[1] ?? []
		let data=[]
		if (literals !== undefined)
		{
			let index=1
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
					else data=[literals]//_fill("blah") or _fill(), _fill({properties}) _fill(x=>blah)
				}
			}
		}				
        this.passages=[]
		if (data.length>0)		{
			this.passages=data.map(passage=> //normalize passages
			{
				//if (passage===undefined || passage === null){return ""}
				var passageType=typeof passage
				if(passageType==="string"|| passageType==="number" ||Object.getPrototypeOf(passage)===Object.prototype || passage.generate || passageType==="function" )
				{return passage}

				return passage.toString()

			})
		}	
		return this
	}
	//console.log(_.scene`hello, ${_.something.name()}. `)
	generate(row)
	{
        let loop=1,results=[],wildcard
        if (this.mise) loop=this.scene.mise.length
        for(let i=0;i<loop;i++)
        {
            if (this.mise) row=this.scene.mise[i].wildcard
            if (this.wildcard)
            {
                wildcard=row[this.wildcard]
                if (this.attribute) results.push(wildcard[this.attribute]())
                else
                {
                    if (wildcard.predicate instanceof reify.classes.Predicate) 
                    {
                        if (this.passages.length===0) results.push(wildcard.predicate.verb)
                        else results.push(wildcard.predicate.prepositions[this.passages[0]] ?? "")
                    }
                    else results.push(wildcard.name())
                }
            }
            else
            {
                this.passages.forEach((passage)=>
                {
                    if (passage.generate) 
                    {
                        results=results.concat(passage.generate(row))
                    }
                    else 
                    {
                        if (passage instanceof Array) results.push(passage.join(""))
                        else results.push(passage.toString())
                    }
                })
            }
            this.prefix.forEach(prefix=>
            {
                results= prefix(results,wildcard)
            })

            this.suffix.forEach(suffix=>
            {
                results = suffix(results,wildcard)
            })
        }
        
		this.text=results.join("")
		return results
	}
	
	htmlTemplate()
	{
		var template = document.createElement("template")
		template.innerHTML = this.text
		return template
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
			if(passage instanceof reify.classes.Passage){passage.reset()}	
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
			if(passage instanceof reify.classes.Passage)
			{
				passage.seed(reify.util.random(this._seed).seed)
			}	
		})
		return this
	}
    setScene(scene)
    {
        this.scene=scene
        this.passages.forEach(passage=>
        {
            if(passage instanceof reify.classes.Passage) passage.setScene(scene)
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

reify.prefixProxy=
{
	get: function(target, property,receiver) 
	{
        if (target.erstatz) //another prefix to process
        {
            if (property==="scene") target.mise=true
            else if (property==="scene") target.polarity=true
            else if (reify.prefix[property]) target.prefix.unshift(reify.prefix[property])
            else if (!target.wildcard)target.wildcard=property
            else target.attribute=property
            return receiver
        }
        else //first prefix
        {
            const erstatzPassage =new Function()
            erstatzPassage.erstatz=true
            if (property==="scene") erstatzPassage.mise=true
            else if (property==="polarity") erstatzPassage.polarity=true
            else if (reify.prefix[property]) erstatzPassage.prefix=[reify.prefix[property]]
            else if (!erstatzPassage.wildcard)erstatzPassage.wildcard=property
            else erstatzPassage.attribute=property
            return new Proxy(erstatzPassage,reify.prefixProxy)
        }
	},
    apply: function(target, thisArg, args)
    {
        const passage=new reify.classes.Passage(...args)    
        passage.prefix=target.prefix ?? []
        passage.mise=target.mise
        passage.polarity=target.polarity
        passage.wildcard=target.wildcard
        passage.attribute=target.attribute
        return new Proxy(passage,reify.suffixProxy)
    }
}
reify.suffixProxy=
{
	get: function(target, property,receiver) 
	{
        if(property==="tense")
        {
            target.tense=true
            return receiver
        }
        else if (reify.suffix.hasOwnProperty(property))
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

reify.clock=new Date()
reify.interval= 60000  //1 minute
reify.turn=1
reify.glossary=new reify.Lexicon()
reify.grammar=new reify.Syntax()
reify.parser=null
reify.tense={imperative:0,present:1, past:2, perfect:3}
reify._viewpoint=null
reify.undoLength=10
reify.lang={}
reify.prefix={}
reify.suffix={}


/* A turn is a processing of all the episodes on the the storyline.  An episode is a plotpoint.narrate with bound arguments.*/ 

reify.tick=function(ticks=1)
{
	this.clock.setTime(this.clock.getTime() + (this.interval*ticks))
}

// #region semantics
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
    clear()
    {
        this.set.clear()
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
/*    now(literals, ...expressions) //DEFECT /Not used
    {
 
        let source=reify.toString(literals, ...expressions).split(/(\[.*?\])/)
        this.set.forEach(fact=>
        {
            let revisedSource=source.map(text=>
            {
                if (text.startsWith("[") && text.endsWith("]"))
                {
                    text=text.slice(1,-1)
                    let term=this.placeholder[text]
                    if (term)
                    {
                        text= fact.entities[term.index].id
                    }
                }
                return text
            }).join("")
            console.log(reify.facts(revisedSource))
        })
            
        return this
    }
        */
}


reify.plot=function plot(){Object.values(reify.plot._fact).forEach((fact)=>reify._update(fact,true))}
reify.plot._entity={}
reify.plot._fact={}//{reality:new reify.Reality()} //plot structure where scenes and facts live.
reify.proxies={}
reify.proxies.newless= //instantiate a class without new operator
{
	apply: function (target, thisArg, args)  //temporary proxy for creating new-less class instances
	{
		return new target(...args)
	}
} 

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
            interpretations[0].gist.forEach(statement=>
            {
                statement.entities= statement.entities.map(entity=>entity=reify.plot._entity[entity])
                new reify.classes.fact(statement)
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


// #endregion

// #region term
reify.proxies.entity=
{	
	//term.property(value) sets value of property and returns term
	//term.property() returns value of property

	get: function(target, property, receiver) //receiver is proxy.
	{
		var methods=
		{
			
			description:(literals, ...expressions)=>
			{
				if(literals===undefined) return target.description
				target.description=reify._(literals,...expressions)
				return receiver
			},
			
			name:(literals, ...expressions)=>
			{
				if(literals===undefined) return target.name
				let name=reify.formatName(literals, ...expressions)
				target.name=name
				reify.glossary.register(name).as({part: "term", key:target.id})
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

			
			target[property]=value

			//reify.now`${target.name} revises ${property}.` DEFECT How ae we doing numerical properites
            

			return receiver
		}

	}
	
}

// #endregion

// #region classes


reify.classes.fact= class Fact
    {
        constructor(statement)
        {
            const {predicate,entities}=statement
            let id=entities[0].id +" "+predicate.id+" "+entities[1].id
            for (let index = 2; index < entities.length; index++) {id=id+" "+predicate.prepositions[index-2]+" "+entities[index].id}
            id="["+id+"]"
            let fact=reify.plot._fact[id]

            if (fact) //update existing fact.
            {
                history[reify.turn]={clock:reify.clock,tense:fact.tense,mood:fact.mood,polarity:fact.polarity }

               
                reify._update(fact) //delete old fact
                fact.tense=statement.tense
                fact.mood=statement.mood
                fact.polarity=statement.polarity
               
            }
            else
            {
                Object.defineProperty(this, "id",{value:id,enumerable:false})
                Object.defineProperty(this, "predicate",{value:statement.predicate,enumerable:false})
                Object.defineProperty(this, "tense",{value:statement.tense,enumerable:false})
                Object.defineProperty(this, "mood",{value:statement.mood,enumerable:false})
                Object.defineProperty(this, "polarity",{value:statement.polarity,enumerable:false})
                Object.defineProperty(this, "entities",{value:statement.entities,enumerable:false})
                Object.defineProperty(this, "history",{value:[],enumerable:false})
                this.history[reify.turn]={clock:reify.clock,tense:this.tense,mood:this.mood,polarity:this.polarity }
                fact=reify.plot._fact[id]=this
            }
            return fact
        }
        get subject(){return this.entities[0]}
        get directObject(){return this.entities[1]}
        get indirectObject(){return this.entities[2]}
        get verb(){return this.predicate.verb}
        get prepositions(){return this.predicate.prepositions}
    }
reify.classes.entity=class Entity
	{
		constructor(literals, ...expressions) // maybe template literal notation or function notation
		{
            let name=reify.toString(literals, ...expressions)
            Object.defineProperties(this,
                {
                    id:{value:reify.formatId(name),enumerable:false},
                    description:{value:"",enumerable:false,writable:true},
                    name:{value:reify.formatName(name),enumerable:false,writable:true},
                    attributive:{value:false,enumerable:false,writable:true},
                    _indexes:{value:[],enumerable:false,writable:false},
                    scenes:{value:new Set(),enumerable:false,writable:false}
                })
			let entity=new Proxy(this,reify.proxies.entity)
			
            reify.plot._entity[entity.id]=entity
			reify.glossary.register(this.name).as({part: "entity", key:entity.id, entity:entity})
        
			return entity
		}
		aka(literals, ...expressions)
		{
			reify.glossary.register(reify.formatName(literals, ...expressions)).as({part: "entity", key:this.id})	
			return this
		}
		kind(literals, ...expressions)
		{
			let kind=reify.plot._entity[reify.formatId(literals, ...expressions)]
            
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
		reify.plot[this.id]={[reify.present]:{[reify.affirmative]:{},[reify.negative]:{}},
                            [reify.past]:{[reify.affirmative]:{},[reify.negative]:{}}}
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
        reify.lang.conjugatePredicate(this,verb,converse)
        return this
        
    }
	
    converse(literals, ...expressions)
	{
		this.#conjugate(reify.toString(literals, ...expressions),true)
		return this
	}
}
reify.classes.Scene=class Scene
{
    static recency = 0
    static updateRecency()
    {
        this.recency+=1
        return this.recency
    }
    constructor(literals, ...expressions)
    {
        
        
        var source=reify.toString(literals, ...expressions)
        
        let {success,interpretations}=reify.sceneParser.analyze(source)
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
            else  //add scene to subplots
            {
                let gist=interpretations[0].gist
                Object.defineProperties(this,
                {   
                    toString:()=>source,
                    select:{value:gist.selector,enumerable:false,writable:false},
                    storylines:{value:[],enumerable:false,writable:true},
                    unfold:{value:()=>this.storyline(),enumerable:false,writable:true},
                    recency:{value:reify.classes.Scene.updateRecency(),enumerable:false,writable:true}, 
                    specificity:{value:gist.specificity,enumerable:false,writable:false},
                    mise:{value:[],enumerable:false,writable:true},
                    

                })

                gist.subplots.forEach(subplot=>subplot.scenes.push(this))
                
                return this
            }
        }
        else
        {
            console.log(interpretations)
            throw new Error("ERROR 0005: Unable to parse reify source code.")

        }

    }
    now(literals,...expressions)
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
                const storylines=[]
                interpretations[0].gist.forEach(statement=>
                {
                   
                    this.mise.forEach(row=>
                    {
                        statement.entities= statement.entities.map(entity=>entity=reify.plot._entity[entity]??row.entity[entity.slice(1,-1)])

                        storylines.push(reify._update(new reify.classes.fact(statement),true)())

                    })


                })
                return reify._(storylines)
            }
        }
        else
        {
            console.log(interpretations)
            throw new Error("ERROR 0005: Unable to parse reify source code.")
        }
        return this
    }

    storyline(index=0)
    {
        return this.storylines[index]??reify._``
    }

    _(literals,...expressions)
    {
        const storyline=reify._(literals,...expressions)
        storyline.setScene(this)
        this.storylines.push(storyline)
        return this
    }

    unfolding(aFunction) 
    {
        this.unfold=aFunction.bind(undefined,this)
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

// #endregion

// #region dsl

reify.dsl={}

/*reusable syntax rules
    argument=>entity |wildcard | placeholder
    preposition=>terminal
    verb=>terminal

*/



reify.dsl.entity=reify.Syntax().configure({filter:(definition)=>definition?.part==="entity"})
reify.dsl.wildcard=reify.Syntax().configure({regex:/^\[[a-zA-Z]\w*\]/})
reify.dsl.argument=reify.Syntax()
    .snip(0)
    .snip(1)   
    .snip(2)
    .configure({mode:reify.Syntax.apt})
reify.dsl.argument[0].snip("entity",reify.dsl.entity).snip("wildcard",reify.dsl.wildcard)
reify.dsl.argument[1].snip("entity",reify.dsl.entity)
reify.dsl.argument[2].snip("wildcard",reify.dsl.wildcard)


reify.dsl.preposition=reify.Syntax().configure({filter:(definition)=>definition?.part==="preposition"})

reify.dsl.prepositionalPhrase=reify.Syntax().configure({minimum:0, maximum:Infinity})
    .snip("preposition",reify.dsl.preposition).snip("target",reify.dsl.argument)
reify.dsl.verb=reify.Syntax().configure({filter:(definition)=>definition?.part==="verb", semantics:interpretation=>
    {
        return true

    }})	
reify.dsl.predicate=reify.Syntax()
    .snip(0)
    .snip(1)
    .configure({mode:reify.Syntax.any,semantics:(interpretation)=>
        {
            return true
        }})
reify.dsl.predicate[0].snip("verb",reify.dsl.verb).snip("wildcard",reify.dsl.wildcard)
reify.dsl.predicate[1].snip("verb",reify.dsl.verb)





/*statement grammar 
    statements=>(statement period)+  //create one or more facts
    statement=>subject verb directObject prepositionalPhrase*
    subject=>entity 
    prepositionalPhrase=>preposition target
    directObject=>entity
    target=>argument
*/

reify.dsl.statements=reify.Syntax()
    .snip("statement").snip("period")
    .configure({maximum:Infinity, semantics:interpretation=>
    {
        interpretation.gist=interpretation.gist.reduce((a,b)=>a.concat(b.statement),[]) //gist= array of statements
        return true
    }})
reify.dsl.statements.period.configure({regex:/^\./,lax:true})
reify.dsl.statements.statement=reify.Syntax()
    .snip("subject",reify.dsl.argument).snip("verb",reify.dsl.verb).snip("directObject",reify.dsl.argument).snip("prepositionalPhrase",reify.dsl.prepositionalPhrase)
    .configure({semantics:interpretation=> //Due to wildcards, each statement may involve multiple facts.  
    {
        let gist =interpretation.gist
        let subject = gist.subject
        let directObject=gist.directObject
        let verb=gist.verb.definition
        let predicate=verb.predicate
        
        let prepositions=(gist.prepositionalPhrase??[]).map(gist=>gist.preposition.definition.key)
        //do prepositions match predicate?
        if (prepositions.length !== predicate.prepositions.length) return false 
        prepositions.forEach((preposition,index)=>{if(preposition!==predicate.prepositions[index]) return false})
      
        let argumentList=[]

        if (verb.converse)
        {
            argumentList.push(directObject.entity?.definition.key ?? directObject.wildcard.definition.match)
            argumentList.push(subject.entity?.definition.key ?? subject.wildcard.definition.match)
        }
        else
        {
            argumentList.push(subject.entity?.definition.key ?? subject.wildcard.definition.match)
            argumentList.push(directObject.entity?.definition.key ?? directObject.wildcard.definition.match)
        }
        predicate.prepositionalPhrase?.forEach(phrase=>argumentList.push(phrase.target.definition.entity))
        interpretation.gist={predicate:predicate,tense:verb.tense,mood:verb.mood,voice:verb.voice,polarity:verb.polarity,entities:argumentList}
        return true

    }})
    reify.dsl.statements.statement.prepositionalPhrase.configure({minimum:0})
    reify.statementParser=reify.Parser({ lexicon: reify.glossary, grammar: reify.dsl.statements, boundary:/^[\.]/,separator:/^[\s\,]+/ })


/*selection DSL:

/*

    expression => term termOperation*  //term as in the terms of an expression, not the terms in an atom
    term => factor factorOperation*
    termOperation => termOperator term
    termOperator => union | unionAll | difference
    factor => group | atom 
    factorOperation => factorOperator factor
    factorOperator => intersection | intersectionAll
    group => leftParen expression rightParen
    atom => trigger  pattern
    trigger => when | whenever | while
    argument =>wildcard entity | entity wildcard | entity | wildcard     
    pattern => subject predicate  directObject prepositionalPhrase*
    subject =>argument
    prepositionalPhrase =>preposition target
    directObject => argument
    target => argument
    argument => entity wildcard | entity | wildcard
    predicate => verb wildcard | verb 
    //`(player [someone] carries lamp [something] or nancy [someone] carries [something]) and [something] is shiny`
   // No: union operator: +, difference operator: -, intersection operator: * because code switching bad for cognitive load.
*/
reify.dsl.atom=reify.Syntax()
    .snip("trigger").snip("pattern")
    .configure({semantics:interpretation=>
    {
        let specificity=0
        const wildcard={}
        let gist =interpretation.gist
        const trigger=gist.trigger.definition.key
        const pattern=gist.pattern
        const subject = pattern.subject
        const directObject=pattern.directObject
        const verb=pattern.predicate.verb.definition
        const match=pattern.predicate.wildcard?.definition.match

        const {predicate,converse,polarity,tense}=verb
        

        let prepositions=(pattern.prepositionalPhrase ?? []).map(gist=>gist.preposition.definition.key)
        //do prepositions match predicate?
        if (prepositions.length !== predicate.prepositions.length) return false 
        prepositions.forEach((preposition,index)=>{if(preposition!==predicate.prepositions[index]) return false})
        
        let argumentList=[]

        if (converse)
        {
            argumentList.push(directObject.entity?.definition.key ?? directObject.wildcard.definition.match)
            argumentList.push(subject.entity?.definition.key ?? subject.wildcard.definition.match)
        }
        else
        {
            argumentList.push(subject.entity?.definition.key ?? subject.wildcard.definition.match)
            argumentList.push(directObject.entity?.definition.key ?? directObject.wildcard.definition.match)
        }
        predicate.prepositionalPhrase?.forEach(phrase=>argumentList.push(phrase.target.entity.definition.key ?? phrase.target.wildcard.definition.match ))

        //for when and while build reify.plot.[predicate.id][tense][polarity][argument1[[argument2[]...[argumentN] data structure
        //for when add a when node at the end of the data structure. Now populates with facts for both when node and parent of when.
        //for whenever build reify.plot.whenever.[predicate.id][tense][polarity][argument1[[argument2[]...[argumentN] data structure instead
        //for while do not do anything additional.
        let whenever=trigger==="whenever",when=trigger==="when",subplot=reify.plot,wheneverPlot

        
    
        subplot[predicate.id]??={}
        subplot=subplot[predicate.id]
        subplot[tense]??={}
        subplot=subplot[tense]
        subplot[polarity]??={}
        subplot=subplot[polarity]

        if (whenever)
        {
            wheneverPlot=wheneverPlot.whenever??={}
            wheneverPlot[predicate.id]??={}
            wheneverPlot=wheneverPlot[predicate.id]
            wheneverPlot[tense]??={}
            wheneverPlot=wheneverPlot[verb.tense]
            wheneverPlot[polarity]??={}
            wheneverPlot=wheneverPlot[polarity]
        }

        argumentList.forEach((argument,index)=>
        {
            if (argument.startsWith("["))
            {
                wildcard[argument.slice(1,-1)]=index
                argument="__"
            }
            else
            {
                wildcard[argument]=index
                specificity+=1
            }
            subplot[argument]??={} 
            subplot=subplot[argument]
            if (whenever)
            {
                wheneverPlot[argument]??={} 
                wheneverPlot=wheneverPlot[argument]
            }
        })
/*
`when player carries ring` translates to: 
plot.carrying[tense][polarity].player.ring.reality=Reality //reality added to by now before calling scene. 
plot.carrying[tense][polarity].player.ring.when={scenes:[], reality:Reality}//reality cleared and populated by now before calling scene.
plot.carrying[tense][polarity].player.ring.whenever={scenes:[]}  //reality is main reality 
while scenes do not need to be captured because they have no trigger.
while reality is the main reality 
*/
        subplot.reality??=new reify.Reality()  
        if (whenever) wheneverPlot??={reality:subplot.reality,scenes:[]}
        if (when)
        {
            subplot.when??={scenes:[], reality:new reify.Reality()}
            subplot=subplot.when
        }
        interpretation.gist={subplots:[subplot],specificity:specificity}
        interpretation.gist.selector=()=> //activation is the reality associated with the pattern
        {
            const selection=[]
            subplot.reality.forEach(fact=>
            {
                const row={wildcard:{},reasoning:[fact]}
                for (const [key, index] of Object.entries(wildcard)) 
                {
                    row.wildcard[key]=fact.entities[index]  
                }
                fact.entities.forEach(entity=>row.wildcard[entity.id]??=entity)
                if (match) row.wildcard[match.slice(1,-1)]??={predicate:predicate,polarity:polarity,tense:tense}
                else row.wildcard[predicate.verb]??={predicate:predicate,polarity:polarity,tense:tense}
                selection.push(row)
            })
           return  selection //[{entity,reasoning}]
        }
        //interpretation.gist==={subplots[subplot],specificity:specificity,selector:selector}

        return true
        
    }})
reify.dsl.trigger=reify.Syntax()
    .configure({filter:(definition)=>definition?.part==="trigger"})
    
reify.dsl.atom.pattern=reify.Syntax()
    .snip("subject",reify.dsl.argument).snip("predicate",reify.dsl.predicate).snip("directObject",reify.dsl.argument).snip("prepositionalPhrase",reify.dsl.prepositionalPhrase)
    .configure({semantics:interpretation=> //Due to wildcards, each statement may involve multiple facts.  
    {  
        
        return true
    }})
reify.dsl.term=reify.Syntax()
    .snip("factor").snip("factorOperation")
    .configure({semantics:interpretation=> //intersection intersectionAll
    {
        const gist=interpretation.gist
        const factor=gist.factor
   
        //factor=={subplots:[{}],specificity:int, selector:()=>{}, specificity:0}
        const operations=gist.factorOperation ?? []
        gist.specificity=factor.specificity+operations.reduce((a,b)=>a+b.factor.specificity,0)
        gist.subplots=[].concat(factor.subplots).concat(operations.reduce((a,b)=>a.concat(+b.factor.subplots),[]) )

        if (operations.length>0) //create new selector that performs factor operations.
        {
            gist.selector=()=>
            {
                const a=factor.selector() 
                operations.forEach(operation=>
                {
                    const b=operation.factor.selector()
                    
                    //  if a.length is 0 or b.length there is no intersection
                    if (a.length===0 || b.length===0) return [] 
                    const results=[]   
                    a.forEach(rowA=>
                    {
                        for (const rowB of b)
                        {
                            const commonKeys = Object.keys(rowA.entity).filter(key => Object.hasown(rowB.entity,key))
                            if (commonKeys.every((key)=>rowA.entity[key]===rowB.entity[key]))//rowB matched rowA
                            {
                                results.push(rowA) //Defect needs to be cloned and reasoning added.
                                if (operation.operator.definition.part==="intersection") break 

                            }
                        }
                    })
                    return results
                })
            }
        } 
        else gist.selector=factor.selector 
        return true
    }})
reify.dsl.expression=reify.Syntax()
    .snip("term",reify.dsl.term).snip("termOperation")
    .configure({semantics:interpretation=> //union unionAll difference
    {
        const gist=interpretation.gist
        const term=gist.term
        const operations=gist.termOperation ?? []
          //term=={subplots:[{}],specificity:int, selector:()=>{}, specificity:0}

        gist.specificity=term.specificity+operations.reduce((a,b)=>a+b.term.specificity,0)
        gist.subplots=[].concat(term.subplots).concat(operations.reduce((a,b)=>a.concat(+b.term.subplots),[]) ) 

        if (operations.length>0) 
        {
            gist.selector=()=>
            {
                const a=gist.term.selection()
                operations.forEach(operation=>
                {
                    const operator =operation.operator.definition.part
                    if (operator==="unionAllOperator")
                    {
                        a.concat(operation.term.selection())
                        return a
                    }
                    if (operator==="differenceOperator") 
                    {
                        const b=operation.term.selection()
                
                        /*  if a.length is 0, everything is already excluded so return a.
                            if b.length is 0, there is nothing to exclude so return a
                            
                        */
                        if (a.length>0 && b.length>0)
                        {
                            /*  if b.length > 0 and b.terms.length is 0 and a has rows, then every thing in a is excluded because there is no correlation to check 
                                example `player carrying _something_ and _something_ is magical excluding player is magical`
                            */
                            
                            if (Object.keys(b.term).length===0) a=[]
                            else
                            {
                                /*  if b has terms, all shared terms in a and b must match in order for the row in  a to be excluded.
                                    examples:
                                    `player carrying _something_ excluding _something_ is magical` a.something must match b.something.
                                    `player carrying _something_ excluding _something_ surface is _quality_` a.something must match b.something.
                                */
                                a.filter(rowA=>
                                {
                                    for (const rowB of b)
                                    {
                                        const commonKeys = Object.keys(rowA.term).filter(key => Object.hasown(rowB.term,key))
                                        if (commonKeys.every((key)=>rowA.term[key]===rowB.term[key]))
                                        {
                                            return false //rowB matched rowA.  therefore exclude rowA
                                        }
                                    }
                                    return true
                                })
                            }
                        }
                        return a
                    }
                    //union operation
                
                    const b=operation.term.selection()
                    if (a.length===0) return b
                    if (b.length===0) return a
                    //add b rows to a unless all terms from b match all terms a
                    const results=a.slice() //copy a
                    
                    b.forEach (rowB=>
                    {
                        if (!a.some(rowA=>
                        {
                            const commonKeys = Object.keys(rowA.term).filter(key => Object.hasown(rowB.term,key))
                            if ((commonKeys.every((key)=>rowA.term[key]===rowB.term[key]))) return true
                        })) results.push(rowB)
                    })
                    return results //return union
                
                })
            }
        }
        else gist.selector=term.selector
       
        return true

    }})
reify.dsl.expression.termOperation   
    .snip("operator").snip("term",reify.dsl.term)
    .configure({minimum:0,maximum:Infinity, greedy:true})
reify.dsl.expression.termOperation.operator
    .configure({mode:reify.Syntax.apt})
    .snip(0)
    .snip(1)
    .snip(2)

reify.dsl.expression.termOperation.operator[0].configure({filter:(definition)=>definition?.part==="unionAllOperator"})
reify.dsl.expression.termOperation.operator[1].configure({filter:(definition)=>definition?.part==="unionOperator"})
reify.dsl.expression.termOperation.operator[2].configure({filter:(definition)=>definition?.part==="differenceOperator"})

reify.dsl.term.factor
    .snip(0) // group=(expression)
    .snip(1,reify.dsl.atom)
    .configure({mode:reify.Syntax.apt})

reify.dsl.expression.term.factor[0]
    .snip("beginGroup").snip("expression",reify.dsl.expression).snip("endGroup")
    .configure({semantics:interpretation=>
    {
        interpretation.gist=interpretation.gist.expression
        return true
    }})
reify.dsl.expression.term.factor[0].beginGroup.configure({filter:(definition)=>definition?.part==="beginGroup"})
reify.dsl.expression.term.factor[0].endGroup.configure({filter:(definition)=>definition?.part==="beginGroup"})

reify.dsl.term.factorOperation
    .snip("operator").snip("factor",reify.dsl.term.factor)
    .configure({minimum:0,maximum:Infinity,greedy:true})
  
reify.dsl.term.factorOperation.operator
    .configure({mode:reify.Syntax.apt})
    .snip(0)
    .snip(1)

reify.dsl.term.factorOperation.operator[0].configure({filter:(definition)=>definition?.part==="intersectAllOperator"})
reify.dsl.term.factorOperation.operator[1].configure({filter:(definition)=>definition?.part==="intersectOperator"})  





 //   do we even need converse anymore now that it is full on predicate logic statements? yes, because of directions: is east of/is west of
    /* player carries ring.  player carries diamond. diamond is shiny
        
        `player carries [something] and [something] is shiny.`
            a=[{something:ring},{something:diamond}]
            b=[{something:diamond}]
            intersection=[{something:diamond},reasoning:[diamond is shiny]]
        
        `[something] is shiny and player carries [something].`
            a=[{something:diamond}]
            b=[{something:ring},{something:diamond}]
            intersection={something:diamond} reasoning:[diamond is shiny]]
         
        `[something] is shiny and player is happy.`
            a=[{something:diamond}]
            b=[{}, reasoning:[player is happy]] //no term
            intersection: [{something:diamond},reasoning:[player is happy]]

    */



    reify.sceneParser=reify.Parser({ lexicon: reify.glossary, grammar: reify.dsl.expression,separator:/^[\s\,]+/ })


    

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
                interpretations[0].gist.forEach(statement=>
                {
                    statement.entities= statement.entities.map(entity=>entity=reify.plot._entity[entity])
                    reify._update(new reify.classes.fact(statement),true)()?.say().append("#story")
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
//reify.tell`Once upon a time`.say().append("#story")
reify.tell=function(literals, ...expressions) //intro
{
    //tell the intro 

    
}

reify._update=function(fact,assert)
{
    //when pattern
    //whenever pattern
    //while pattern

    let subtree=reify.plot
    const path=[fact.predicate.id].concat(fact.tense).concat(fact.polarity).concat(fact.entities.map(entity=>entity.id))
    const when=[]
    function traverse(path,subtree,retract)
    {
        if (path.length===0)
        {
            if (assert)
            {
                subtree.reality.add(fact)
                if(subtree.when)
                {
                    subtree.when.reality.clear()
                    subtree.when.reality.add(fact)
                    when.push(...subtree.when.scenes)
                }

            }
            else subtree.reality.delete(fact)  //retract
            return
        }
        if (subtree[path[0]]) traverse(path.slice(1), subtree[path[0]])
        if (subtree.__) traverse(path.slice(1),subtree.__)
        return 
    }

    traverse(path,subtree,true)

    when.sort((a,b)=> //sort descending order by specificity with ties broken by recency.
    {
        if (a.specificity > b.specificity) return true
        if (a.specificity < b.specificity) return false
        if (a.recency > b.recency) return true
        return false
    })
    
    const subplot = function subplot()
    {
        if (when.length>0)
        {
            const scene=when.shift()
            const mise=scene.mise=scene.select()
            if (mise.length >0) return scene.unfold(subplot)
        }
        return reify._``
    }
    return subplot
    
}


// #end region
// #region error messages
var errors=
{

}
// #end region



