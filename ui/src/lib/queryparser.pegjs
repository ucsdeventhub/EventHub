Main = filters:Filter* _ query:(Words) { return {filters, query}; }

Filter
	= key:Key ":" value:Value _ { return {key, value}; }

Key
	=  Word

Value
	= Word
    / "\"" ws:Words "\"" { return ws; }

Words
	= w:WordSpace* { return w.join(" "); }

WordSpace
	= w:Word _ { return w }

Word
	= [a-zA-Z0-9,-]+ { return text(); }


_ "whitespace"
  = [ \t\n\r]* { return " " }
