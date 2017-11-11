/*

This "hello_world_Goldelox" sketch provides a very easy introduction for beginners or Arduino users in
interfacing any serial-display-module from 4D Systems Pty. Ltd.

Before using this sketch, the 4D display module to be used must be converted to a serial (SPE) display
module using the Workshop 4 IDE also provided by 4D Systems. Workshop 4 can be downloaded
from http://www.4dsystems.com.au/prod.php?id=172

Converting any 4D Systems display to serial display using the SPE tool in Workshop 4 has been covered and
discussed in the beginning of this application note. In addition, all commands for receiving control,
controlling or writing to the display is discussed and presented in detail in the GOLDELOX-SPE-COMMAND-SET
manual.(Note: the uOLED-160-G2 was selected for this tutorial).

It is strongly recommended then that a cioy of the GOLDELOX-SPE-COMMAND-SET be downloaded and studied to
give the user an understanding of the wide array of commands available which can be used in any
Arduino project using any 4D Systems intelligent display module.

http://www.4dsystems.com.au/prod.php?id=172

This sketch provides three lines of text strings which if compiled and downloaded to the Arduino board
be displayed to show plain unformatted text string or a formatted text string ( refer to the 3rd part of
this sketch.

*/

// include 4D Systems Goldelox library for Arduino
#include <Goldelox_Const4D.h>
#include <Goldelox_Const4DSerial.h>
#include <Goldelox_Serial_4DLib.h>
#include <Goldelox_Types4D.h>

#define DisplaySerial Serial                      // define display serial port0

Goldelox_Serial_4DLib Display(&DisplaySerial);    // declare this serial port

void setup(void)
{
  //Reset the display, assuming Display is connected to Arduino via 4D Arduino Adaptor Shield
  pinMode(2, OUTPUT);			// D2 on Arduino resets the Display
  digitalWrite(2, HIGH);		// Reset Display
  delay(100);					// 100ms Reset pulse
  digitalWrite(2, LOW);			// Disable Reset
  
  delay(3000);                  // Allow time for the display to initialize before communicating
  Display.TimeLimit4D = 5000 ;  // 5 second timeout on all commands
  DisplaySerial.begin(9600) ;   // initialize serial port and set Baud Rate to 9,600
  Display.gfx_Cls() ;           // clear display
//
//  Below this comment is the first string to be serially sent to the display.
//
  Display.putstr("Hello World\n\n") ;  // send "Hello World" string to display
//
//  Below this comment is the second string to be serially sent to the display. Note the double spacing
//  to provide clarity in the presentation.
//
  Display.putstr("Serial Display test\n\n\n") ;  //send second string to display
//
//  Below this comment is the third string to be serially sent to the display. Again for clarity
//  in presentation, tripple spacing has been placed and used. Furthermore, this text
//  string introduces to the user some font and text-formatting capabilities available. There are six(6)
//  statements before the Display.putstr statement which instructs the Arduino to do this. You can
//  edit the text string to show the display model you have. Autodetecting the display model is
//  not covered by this application note.
//
  Display.txt_Attributes(BOLD + INVERSE + ITALIC + UNDERLINED) ; // change and set new text format
  Display.txt_Xgap(3) ;
  Display.txt_Ygap(3) ;
  Display.txt_BGcolour(RED) ;
  Display.txt_FGcolour(WHITE) ;
  Display.txt_MoveCursor(5, 0) ;                     // use this cursor position
  Display.putstr("uOLED-160-G2 SPE + Arduino\n") ;   //send third string to display
}

void loop(void)
{
	// do nothing here
}

