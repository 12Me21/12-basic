
  * ### Alternate function syntax
  The first argument can be written before the function:
  >*argument1* **.** *function*__(__ *arguments* [ , ... ] **)**  
  >*function*__(__ *argument1* **,** *arguments* [ , ... ] **)**
  
## Built-in Functions

  * ### Substring
  >**MID$(** *string$* **,** *start* **,** *length* **)** -> *substring$*
  * ### Get ASCII code
  >**ASC(** *string$* **)** -> *ascii*
  * ### Get Character
  >**CHR$(** *ascii* **)** -> *character$*
  * ### Length
  >**LEN(** *string$* **)** -> *length*
  >**LENGTH(** *string$* **)** -> *length*
  * ### String to Number
  >**NUMBER(** *string$* **)** -> *number*  
  >**NUMBER(** *string$* **,** *base* **)** -> *number*
  * ### Number to String
  >**STRING$(** *number* **)** -> *string$*  
  >**STRING$(** *number* **,** *length* **)** -> *string$*  
  >**STRING$(** *number* **,** *length* **,** *base* **)** -> *string$*
  * ### Random Number
  >**RANDOM(** *range* **)** -> *number*  
  >**RANDOM(** *minimum* **,** *maximum* **)** -> *number*
  * ### Cosine (angles range from 0 to 1)
  >**COS(** *angle* **)** -> *x*  
  >**COS(** *angle* **,** *radius* **)** -> *x*
  * ### Sine (angles range from 0 to 1)
  >**SIN(** *angle* **)** -> *y*  
  >**SIN(** *angle* **,** *radius* **)** -> *y*
  * ### Angle from X and Y (atan)
  >**ANGLE(** *x* **,** *y* **)** -> *angle*
  * ### Hypotenuse
  >**HYPOT(** *x* **,** *y* **)** -> *hypotenuse*
  * ### String search (-1 = not found)
  >**FIND(** *string$* **,** *search$* **)** -> *location*  
  >**FIND(** *string$* **,** *search$* **,** *start* **)** -> *location*
  * ### Uppercase
  >**UPPER$(** *string$* **)** -> *uppercase$*
  * ### Lowercase
  >**LOWER$(** *string$* **)** -> *lowercase$*
  * ### Get characters from end
  >**RIGHT$(** *string$* **,** *length* **)** -> *end$*
  * ### Get number input
  >**INPUT(** **)** -> *number*
  * ### Get string input
  >**INPUT$(** **)** -> *string$*
  * ### Print a list of values.
  >**PRINT** [ *value* ] [ , ... ]  
  > ### Replace 
  >**REPLACE$**
