## Operators

  * ### Negate
  >**-** *number* -> *number*
  * ### Logical Not
  >**!** *number* -> *number*  
  >**NOT** *number* -> *number*
  * ### Bitwise Not
  >**~** *number* -> *number*
  
  * ### Exponent
  >*number* **^** *number* -> *number*
  
  * ### Multiply
  >*number* __*__ *number* -> *number*
  * ### String repeat
  >*string* __*__ *number* -> *string*
  * ### Divide
  >*number* __/__ *number* -> *number*
  * ### Mod (Remainder) a-floor(a/b)*b
  >*number* __%__ *number* -> *number*
  * ### Floored Division
  >*number* __\\__ *number* -> *number*
  
  * ### Add
  >*number* **+** *number* -> *number*
  * ### String concatenate / type coercion
  >*string$* **+** *value* -> *string$*
  * ### Subtract
  >*number* **-** *number* -> *number*
  
  * ### Left Shift
  >*number* **<<** *number* -> *number*
  * ### Right Shift (unsigned)
  >*number* **>>** *number* -> *number*
  
  * ### Greater
  >*number* **>** *number* -> *number*  
  >*string$* **>** *string$* -> *number*
  * ### Less
  >*number* **<** *number* -> *number*  
  >*string$* **<** *string$* -> *number*
  * ### Greater or Equal
  >*number* **>=** *number* -> *number*  
  >*string$* **>=** *string$* -> *number*
  * ### Less or Equal
  >*number* **<=** *number* -> *number*  
  >*string$* **<=** *string$* -> *number*
  
  * ### Equal
  >*number* **==** *number* -> *number*  
  >*string$* **==** *string$* -> *number*
  * ### Not Equal
  >*number* **!=** *number* -> *number*  
  >*string$* **!=** *string$* -> *number*
  
  * ### Bitwise And
  >*number* **&** *number* -> *number*
  * ### Bitwise Or
  >*number* **|** *number* -> *number*
  * ### Bitwise Xor
  >*number* **~** *number* -> *number*
  
  * ### Logical And
  >*value* **AND** *value* -> *number*
  * ### Logical Or. Returns the first truthy value
  >*value* **OR** *value* -> *value*
  * ### Logical Xor
  >*value* **XOR** *value* -> *number*
