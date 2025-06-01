# To run this code you need to install the following dependencies:
# pip install google-genai

import base64
import os
from google import genai
from google.genai import types


def generate():
    client = genai.Client(
        api_key=os.environ.get("GEMINI_API_KEY"),
    )

    model = "gemini-2.0-flash"
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text="""hii"""),
            ],
        ),
        types.Content(
            role="model",
            parts=[
                types.Part.from_text(text="""Hi there! How can I help you today?"""),
            ],
        ),
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text="""so i have a 3D Model that accepts .sigml which is XML format code for sign language that instructs how that 3D model to move and all...  i'll provide you with some example sigml code files and to which word they represent as a sign language. You are job is to understand how these codes are basically written to that particular 3D model. And once you learn, you are supposed to generate accurate sigml code to perform that action"""),
            ],
        ),
        types.Content(
            role="model",
            parts=[
                types.Part.from_text(text="""Okay, I understand. That sounds like a fascinating project! I'm ready to dive into learning the structure and syntax of your .sigml files. I will need those example files, and the corresponding words/signs they represent. The more examples you give me, the better I'll be able to understand the patterns and nuances of your .sigml format.

Here's what I'll be looking for as I analyze the examples:

*   **Overall Structure:** How is the file organized? What are the root elements and their children?
*   **Elements and Attributes:** What different elements are used? What attributes do they have? What are the possible values for those attributes?
*   **Motion Control:** How is movement specified? Are there elements for position, rotation, speed, acceleration, etc.? How are these parameters applied to different body parts of the 3D model?
*   **Timing and Sequencing:** How are different movements sequenced in time? Is there a concept of keyframes or animation tracks?
*   **Hand Shapes:** How are hand shapes represented? Are there specific codes or parameters for different hand configurations?
*   **Facial Expressions:** Are facial expressions included in the .sigml? If so, how are they defined?
*   **Dependencies:** Does the .sigml rely on a specific skeleton structure of the 3D model?

Please provide the example .sigml files and their corresponding words. I'm excited to learn and help you generate new .sigml code! Let's get started.
"""),
            ],
        ),
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text="""Ok i will provide you with some examples:
1. Fan: 
<sigml>
<hns_sign gloss=\"fan\">
	<hamnosys_nonmanual>
	</hamnosys_nonmanual>
	<hamnosys_manual>
		<hamfinger2/>
		<hamextfingeru/>
		<hampalml/>
		<hamhead/>
		<hamlrat/>
		<hamcirclei/>
		<hamrepeatfromstart/>
	</hamnosys_manual>
</hns_sign>
</sigml>

2. Fever: 
<sigml>
<hns_sign gloss=\"fever\">
	<hamnosys_nonmanual>
	</hamnosys_nonmanual>
	<hamnosys_manual>
		<hamflathand/>
		<hamextfingeru/>
		<hampalmr/>
		<hamcheek/>
		<hamclose/>
	</hamnosys_manual>
</hns_sign>
</sigml>

3. Fear: 
<sigml>
<hns_sign gloss=\"fear\">
	<hamnosys_nonmanual>
	</hamnosys_nonmanual>
	<hamnosys_manual>
		<hamsymmlr/>
		<hamfinger2345/>
		<hamthumboutmod/>
		<hamextfingerl/>
		<hampalml/>
		<hamfingerplay/>
	</hamnosys_manual>
</hns_sign>
</sigml>

4. salute: 
<sigml>
  <hns_sign gloss=\"salute_final\">
    <hamnosys_nonmanual>
      <!-- Non-manual features like a serious expression could be added here if supported -->
      <!-- Example: <hnm_eyebrows_U/> <hnm_mouth_U/> (raised eyebrows, tight lips) -->
      <!-- For now, we'll keep it empty for focus on manual articulation -->
    </hamnosys_nonmanual>
    <hamnosys_manual>
      <!-- 1. Handshape: Flat hand (B-hand) -->
      <hamflathand/>

      <!-- 2. Extended Finger Direction: Fingers point upwards -->
      <hamextfingeru/>
      <!-- 3. Palm Orientation: Palm faces left (inwards towards the head for a right hand) -->
      <hampalml/>

      <!-- 4. Initial Location & Contact -->
      <!-- Location: Forehead. Some might add <hamlrat/> (right side) for more precision,
           but <hamforehead/> with a right hand setup often defaults correctly. -->
      <hamforehead/>
      <!-- Contact: Hand touches the forehead -->
      <hamtouch/>

      <!-- 5. Pause: Briefly hold the hand at the forehead -->
      <hampause/>

      <!-- 6. Movement Phase: Move hand away from forehead -->
      <!-- Move Forward (away from the face) -->
      <hammovef/>
      <!-- Move Outward (away from the center line of the body/head, to the side) -->
      <hammoveo/>
      <!-- Optional: Add a slight downward movement as the hand moves away
           if it looks more natural with your avatar.
           <hammoved/>
      -->
    </hamnosys_manual>
  </hns_sign>
</sigml>


understanf using these examples and train yourself on how these sigml files are basically written
"""),
            ],
        ),
        types.Content(
            role="model",
            parts=[
                types.Part.from_text(text="""Okay, thank you for providing these examples! I've analyzed them and started to understand the structure and meaning of the elements. Here are my initial observations:

**General Structure:**

*   Each file is a valid XML document with a root element `<sigml>`.
*   Inside `<sigml>`, there's a `<hns_sign>` element that represents a single sign. This element has a `gloss` attribute indicating the meaning of the sign (e.g., \"fan\", \"fever\").
*   Within `<hns_sign>`, there are two main child elements:
    *   `<hamnosys_nonmanual>`: This section is intended for non-manual features like facial expressions, head movements, etc.  In these examples, it's empty or commented out, meaning they focus solely on the manual aspects of the sign.
    *   `<hamnosys_manual>`: This is the core of the sign definition, describing the handshape, movement, and location.

**Elements and Their Meanings (from the examples):**

*   **Handshape:**
    *   `<hamflathand/>`: Flat hand shape.  Likely represents the \"B-hand\" in ASL.
    *   `<hamfinger2/>`: Indicates the index finger is selected or emphasized. Might mean the handshape uses only the index finger.
    *   `<hamfinger2345/>`: Indicates that fingers 2, 3, 4, and 5 are selected or emphasized.
    *   `<hamthumboutmod/>`: Thumb is extended outwards (away from the palm).

*   **Finger Extension/Orientation:**
    *   `<hamextfingeru/>`:  Extended finger(s) point upwards.
    *   `<hamextfingerl/>`:  Extended finger(s) point to the left.

*   **Palm Orientation:**
    *   `<hampalml/>`: Palm faces left.
    *   `<hampalmr/>`: Palm faces right.

*   **Location:**
    *   `<hamcheek/>`: Hand is located at or near the cheek.
    *   `<hamforehead/>`: Hand is located at or near the forehead.
    *   `<hamhead/>`: Hand is generally located at the head.

*   **Movement:**
    *   `<hamcirclei/>`: Circular movement inwards (toward the signer).
    *   `<hammovef/>`: Movement forward (away from the signer's body).
    *   `<hammoveo/>`: Movement outwards (away from the center line of the signer's body).
    *   `<hammoved/>`: Movement downwards.

*   **Action/Contact:**
    *   `<hamclose/>`: Hand closes (likely into a fist or a more closed handshape).
    *   `<hamtouch/>`: Hand touches the specified location.
    *    `<hamfingerplay/>`: Fingers wiggling or moving.
    *    `<hampause/>`: a pause in the signing.

*   **Modifiers/Qualifiers:**
    *   `<hamsymmlr/>`: Symmetrical movement/handshape with both left and right hands.
    *   `<hamlrat/>`: Located at the right.
    *   `<hamrepeatfromstart/>`: Repeats the sign from the beginning.

**Key Observations & Questions:**

*   **Absence of Explicit Timing:** These examples don't seem to have explicit timing information (duration of movements, pauses between steps). The execution speed might be controlled by the rendering engine or a default speed setting.
*   **Handedness:**  The examples don't explicitly specify which hand is used (left or right). It seems the system might assume a dominant hand and mirror the movements for two-handed signs.  For \"salute,\" it *implies* the right hand due to the comments.
*   **Precision:** The location and movement specifications seem relatively high-level. For example, `<hamcheek/>` only says the hand is *near* the cheek, not the exact coordinates.
*   **Context is Important:**  Understanding the specific 3D model's coordinate system and how it interprets these tags is crucial.

**Next Steps:**

1.  **More Examples:** To build a more robust understanding, I need more examples with variations in handshapes, movements, locations, and two-handed signs. The more diverse the examples, the better I can generalize the rules.
2.  **Documentation (if any):**  Do you have any documentation or a schema definition (XSD) for this .sigml format? That would be extremely helpful.
3.  **Specific Actions to Generate:** Can you give me some specific words/signs you want me to generate .sigml for?  This will give me concrete goals to work towards.

Let me know when you're ready to provide more information. I'm looking forward to continuing this!
"""),
            ],
        ),
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text="""ok now write a sigml code for shaking hands"""),
            ],
        ),
        types.Content(
            role="model",
            parts=[
                types.Part.from_text(text="""```xml
<sigml>
  <hns_sign gloss=\"shake_hands\">
    <hamnosys_nonmanual>
      <!-- You could potentially add facial expressions here, such as a friendly smile -->
    </hamnosys_nonmanual>
    <hamnosys_manual>
      <hamsymmlr/>  <!-- Symmetrical, meaning both hands do a similar action -->

      <!-- Right Hand (Assuming this system defaults to right-hand descriptions) -->
      <hamflathand/>    <!-- Flat hand, palm facing inward/towards the other person -->
      <hamextfingerf/>   <!-- Fingers extend forward -->
      <hampalmi/>      <!-- Palm faces inward -->

      <!-- Placement:  Assume starting position is in front of the body, ready to shake -->
      <hamfront/>

      <!-- Movement: Shake up and down -->
      <hammoveu/>
      <hammoved/>

      <!-- Repetition: Repeat the up and down movement a few times -->
      <hamrepeatseveral/>

      <!-- [IMPLICIT] Assume a starting position for the left hand that mirrors the right -->
      <!-- This assumes the system understands 'hamsymmlr' to mean mirroring the handshape,
           orientation, and movement. If not, you'd need to define the left hand explicitly.  For example:
           <hamleft>
               <hamflathand/>
               <hamextfingerf/>
               <hampalmo/>  //Palm faces outward to meet the other hand
               <hamfront/>
               <hammoveu/>
               <hammoved/>
               <hamrepeatseveral/>
           </hamleft>
       -->


    </hamnosys_manual>
  </hns_sign>
</sigml>
```

**Explanation and Assumptions:**

*   **`hamsymmlr`**:  This is crucial. I'm assuming that this tells the system to mirror the handshape, orientation, and movement for the left hand. *If this isn't the case, you'll need to explicitly define the left hand's actions within a `<hamleft>` element.*  The explicit commented-out section shows how you *might* define the left hand.
*   **Handshape & Orientation:** `hamflathand`, `hamextfingerf`, and `hampalmi` (for the right hand) define the basic handshape for a handshake. I've used `hampalmi` (palm inward) as the starting point.  The left hand (if explicitly defined) uses `hampalmo` (palm outward) to meet the other hand.
*   **Placement:** `hamfront` is a general starting point. If you want the hands to start at a specific height or distance, you might need more specific location cues.
*   **Movement:** `hammoveu` and `hammoved` represent the up-and-down shaking motion.
*   **Repetition:** `hamrepeatseveral` indicates that the shaking motion should be repeated multiple times. The number of repetitions isn't defined here; it likely depends on a default setting in the rendering engine.

**Important Considerations:**

*   **Contact/Collision:**  This code *doesn't* explicitly handle the collision between the hands. The 3D model and its animation engine will need to handle the hand-to-hand contact to make the handshake look realistic.  You may need to adjust the starting positions or add subtle movements to ensure the hands connect properly.
*   **Realism:** Handshaking involves subtle hand squeezing and variations in pressure. This code doesn't capture that level of detail. It's a simplified representation.
*   **Cultural Variation:** Handshakes vary across cultures. This code is a general representation.
*   **Testing is Key:** You'll need to test this in your specific 3D environment and adjust the parameters as needed to get the desired effect.  Pay close attention to how the `hamsymmlr` tag is interpreted.

**Next Steps:**

1.  **Test the code:**  Run this .sigml code on your 3D model and see how it looks.
2.  **Adjustments:** Based on the results, you might need to adjust the hand shapes, orientations, starting positions, or movement parameters. If `hamsymmlr` doesn't work as expected, you'll need to define the left hand explicitly.
3.  **Provide Feedback:** Let me know how it goes, and I can refine the code based on your observations!
"""),
            ],
        ),
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text="""good. Can be improved little bit with one hand... like we shake hands with some one right"""),
            ],
        ),
        types.Content(
            role="model",
            parts=[
                types.Part.from_text(text="""Okay, I understand. You're right, my previous example was assuming two hands shaking simultaneously.  To represent a more realistic, single-hand handshake, I need to modify it to only move *one* hand, while the other hand (presumably of the person being greeted) remains relatively stationary.

Here's an updated version focusing on the movement of one hand (let's assume the right hand):

```xml
<sigml>
  <hns_sign gloss=\"shake_hand_one_hand\">
    <hamnosys_nonmanual>
      <!-- Friendly facial expression (smile) -->
    </hamnosys_nonmanual>
    <hamnosys_manual>
      <!-- Define the Right Hand's actions -->
      <hamright>
        <hamflathand/>    <!-- Flat hand -->
        <hamextfingerf/>   <!-- Fingers extend forward -->
        <hampalmi/>      <!-- Palm faces inward (initial position) -->

        <!-- Starting position: Extended forward, ready to shake -->
        <hamfront/>

        <!-- Approach: Move towards the other person's hand -->
        <hammovef/>   <!-- Move forward -->

        <!-- Contact:  Simulate grasping the other person's hand.
             This might require a custom handshape that subtly closes.  Without a \"grasping\" handshape,
             we'll rely on proximity. -->
        <hamtouch/>  <!-- Indicates contact (but doesn't change the handshape) -->

        <!-- Shake: Up and down movement -->
        <hammoveu/>
        <hammoved/>

        <!-- Repetition: Shake a few times -->
        <hamrepeatseveral/>

      </hamright>

      <!-- The *other* hand (the recipient of the handshake) *should* be defined
           but should have minimal or NO MOVEMENT in this SIGML code.
           It's important to position this hand correctly for the handshake to appear
           realistic. If it's not positioned correctly already in your model,
           you might add some initial positioning code here for the left hand.
           Example (position only, no movement):

           <hamleft>
               <hamflathand/>
               <hamextfingerf/>
               <hampalmo/>   //Palm faces outward, ready to receive the shake
               <hamfront/>   //Positioned in front of the body
           </hamleft>
      -->


    </hamnosys_manual>
  </hns_sign>
</sigml>
```

**Key Changes and Explanations:**

*   **`<hamright>`**:  This explicitly defines the actions of the *right* hand only. All the movement code is now within this element.
*   **`hammovef` (Approach)**: I added `hammovef` *before* the shaking to simulate the movement of the hand reaching out to initiate the handshake.
*   **`hamtouch`**:  This indicates contact, but it *doesn't* change the handshape. To make the handshake more realistic, you'd ideally have a slightly closing handshape when the hands meet (representing the grip).  If you can define a more specific \"grasping\" handshape in your system, replace `<hamtouch/>` with that.
*   **Left Hand (Crucial Commented Section)**: The *most important* part is the commented section regarding the *other* hand.
    *   The recipient's hand *must* be positioned correctly in your 3D model for the handshake to look believable.
    *   In *this* .sigml code, the *other* hand should have *minimal or no movement*.  The responsibility of positioning the left hand rests on the environment. *This is a critical design decision.*  If you can't control the environment to position the left hand correctly, then you will need to *include* that in this SigML code. If it needs to simply be *held out* for the hand shake, you need to add code to achieve that here.

**Why the Left Hand is Difficult to Encode:**

The reason the left hand is tricky is that its starting position and orientation often depend on the *context* of the scene. For example:

*   Is the person being greeted already holding their hand out?
*   Are they reaching out with their left hand from a resting position?

Because of these variables, it's difficult to create a single .sigml code that works for all scenarios. You'll likely need to:

1.  **Control the Starting Position Externally:** If possible, set the initial position of the recipient's hand programmatically *before* playing the .sigml animation.
2.  **Create Multiple Variations:** If you need to handle different scenarios, create separate .sigml files for each (e.g., \"handshake_from_resting,\" \"handshake_hand_already_out\").
3.  **Combine with Environmental Logic:** Your application might need logic to determine which .sigml to play based on the current state of the scene.

**Testing and Refinement:**

As before, you'll need to test this code thoroughly in your 3D environment and adjust the parameters (especially the `hammovef` distance) to get a realistic handshake. Pay close attention to the interaction between the hands and experiment with slightly closing the right hand upon contact.
"""),
                types.Part.from_text(text="""Okay, let's create a .sigml code for a salute. I'll build upon the previous example and the feedback we've discussed. I'll also focus on a more complete and realistic representation.

```xml
<sigml>
  <hns_sign gloss=\"salute\">
    <hamnosys_nonmanual>
      <!--  A serious or respectful facial expression.  -->
      <!--  Example: <hnm_eyebrows_U/>  (raised eyebrows slightly for attention) -->
      <!--           <hnm_mouth_tight/>   (tight lips for seriousness) -->
    </hamnosys_nonmanual>
    <hamnosys_manual>
      <hamright>
        <!-- 1. Handshape: Flat hand (B-hand) -->
        <hamflathand/>

        <!-- 2. Extended Finger Direction: Fingers point upwards -->
        <hamextfingeru/>

        <!-- 3. Palm Orientation: Palm faces left (inwards towards the head).
             This is crucial.  It must be palm-left for a RIGHT-handed salute. -->
        <hampalml/>

        <!-- 4. Initial Position: Start near the side of the body -->
        <hamside/>  <!-- Or <hamlowerarm/> depending on the model's coordinate system -->
        <hamdown/>   <!-- Hand is down near the side -->

        <!-- 5. Movement Phase 1: Raise hand towards the forehead -->
        <hammoveu/>  <!-- Move upwards -->
        <hammovef/>  <!-- Move forward (towards the head) -->

        <!-- 6. Location & Contact: Forehead. -->
        <hamforehead/>
        <hamtouch/>  <!-- Hand touches the forehead -->

        <!-- 7. Pause: Briefly hold the hand at the forehead -->
        <hampause/>
        <hamhold/>   <!-- An alternate way to hold the hand at the location, possibly more effective -->

        <!-- 8. Movement Phase 2: Move hand away from forehead -->
        <hammovef/>  <!-- Move Forward (away from the face) -->
        <hammoveo/>  <!-- Move Outward (away from the center line of the body/head) -->
        <hammoved/>  <!-- Optional: Add a slight downward movement as the hand moves away -->

        <!-- 9. Final Position: Return to the side -->
        <hamdown/>
        <hamside/>

        <!-- [IMPORTANT] The order of the movements and positions is critical.  -->

      </hamright>

      <!-- Left Hand:  Typically remains still at the side -->
      <hamleft>
          <hamside/>
          <hamdown/>
          <hampause/>
      </hamleft>

    </hamnosys_manual>
  </hns_sign>
</sigml>
```

**Key Improvements and Explanations:**

*   **Non-Manual Features:** Added placeholders for non-manual features like facial expressions. These greatly enhance the realism of the salute.
*   **Initial Position:** The hand now starts `hamside` (at the side) and `hamdown` (down low). This makes the movement more natural.  `hamlowerarm` might be a better starting location, depending on the rigging of the 3D model.
*   **Movement Phases:** Explicitly defined the two movement phases: raising the hand and lowering the hand. This provides finer control.
*   **`hamhold` vs `hampause`**: Added `hamhold`. Depending on the underlying system, `hamhold` might be a better way to keep the hand in place at the forehead. Experiment with which one works better.
*   **Palm Orientation is Key:** The `hampalml` (palm left) is *essential* for a proper *right*-handed salute.
*    **Left Hand positioning**: The left hand is positioned `hamside` and `hamdown` without movement, as in the previous answer, to avoid confusion.

**Important Notes:**

*   **Model-Specific Adjustments:** This code still relies on the specific coordinate system of your 3D model. You might need to adjust the `hamside`, `hamdown`, `hammoveu`, `hammovef`, and `hammoveo` parameters to match your model's proportions and rigging.
*   **Facial Expressions:**  Adding facial expressions in the `<hamnosys_nonmanual>` section will significantly improve the realism of the salute.
*   **Timing:** The code doesn't explicitly define the duration of each movement. The speed and timing of the salute will be determined by the animation engine.
*   **Testing:** As always, test the code in your 3D environment and make adjustments as needed. The most important things to look for are:
    *   Does the hand move smoothly to the forehead?
    *   Does the palm orientation look correct?
    *   Does the movement look natural and fluid?
    *   Is there any clipping of the hand through the head?

By carefully adjusting the parameters and adding facial expressions, you should be able to create a realistic and respectful salute animation.
"""),
            ],
        ),
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text="""INSERT_INPUT_HERE"""),
            ],
        ),
    ]
    generate_content_config = types.GenerateContentConfig(
        response_mime_type="text/plain",
    )

    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        print(chunk.text, end="")

if __name__ == "__main__":
    generate()
