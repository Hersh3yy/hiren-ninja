<template>
  <div class="container">
    <div class="card_frame">
      <div class="card_body">
        <div class="card_head">
          <div class="card_main">
            <h5>{{ type }}</h5>
            <h1 class="name">{{ name }}</h1>
            <span class="health">{{ hp }} HP</span>
            <img
              class="fire_type"
              :src="energyTypeImage"
              :alt="`${energyType} Energy Type Symbol`"
            />
          </div>
          <div class="img_frame">
            <div
              class="poke_img"
              :style="{ backgroundImage: `url(${imageUrl})` }"
            ></div>
          </div>
          <div class="poke_facts">
            <span>{{ facts }}</span>
          </div>
        </div>
        <!-- Rest of the card content -->
        <div class="copyinfo">
          <span style="margin-right: 1.25em"
            ><strong>{{ creator }}</strong></span
          >
          <span style="margin-right: 1.25em">{{ copyright }}</span>
          <span
            ><strong>{{ cardNumber }}</strong></span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    type: { type: String, default: "Basic Pokemon" },
    name: { type: String, required: true },
    hp: { type: String, required: true },
    energyType: { type: String, default: "Fire" },
    energyTypeImage: { type: String, required: true },
    imageUrl: { type: String, required: true },
    facts: { type: String, required: true },
    creator: { type: String, default: "Brendan Pettis" },
    copyright: {
      type: String,
      default: "©1995, 96, 98 Nintendo, Creatures, GAMEFREAK ©1999 Wizards.",
    },
    cardNumber: { type: String, default: "46/102 ●" },
  },
};
</script>

<style scoped>
/* Paste the entire CSS content here */
/* Sets up the card text */
body {
  background-color: tan;
  padding: 1em;
  font-family: "Gill Sans", "Gill Sans MT", "Cabin", sans-serif;
  text-shadow: 0 0 0.05em rgba(0, 0, 0, 0.35);
  margin-left: 33%;
}

/* Contains everything */
.container {
  position: relative;
  width: 474px;
}
.container:after {
  content: "";
  display: block;
  padding-top: 698px;
}

/* Outlines the card & sets up realistic box shadow */
.card_frame {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-radius: 15px;
  background-color: #ffe50a;
  background-image: linear-gradient(to top, #ffe50a, #ffea3d 70%, #ffe50a);
  box-shadow: 0 2.5px 2.5px rgba(0, 0, 0, 0.5);
}

/* Creates card body based on background image */
.card_body {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: 26px;
  background-image: url(https://img00.deviantart.net/0614/i/2012/106/a/e/classic_pkmn_tcg_texture_pack_by_flamingclaw-d4wcj31.png);
  background-size: cover;
  z-index: 1;
}

/* Sets up name nicely */
.card_head {
  padding: 0 5.1%;
}
/* Pulls the image into the card */
.card_main {
  position: relative;
  height: 50px;
}

h5 {
  margin-top: 10px;
  margin-bottom: 0;
  padding: 0;
}
.name {
  margin-top: -0.000001%;
  padding-top: 0;
  font-size: 28px;
  margin-bottom: -9%;
  padding-bottom: 0;
}

/* Sets up the HP */
.health {
  right: 9%;
  bottom: 3%;
  margin-left: 70%;
  letter-spacing: -0.05em;
  font-weight: 700;
  font-size: 26px;
  font-family: "Century Gothic", CenturyGothic, "Montserrat", sans-serif;
  color: #ff0000;
  text-shadow: 0 0 0.05em rgba(255, 0, 0, 0.15);
  transform: scale(0.92, 1);
  transform-origin: right;
}
/* Set up the fire type image */
.fire_type {
  align: right;
  border-radius: 100px;
  width: 31px;
  height: 31px;
  margin-bottom: -4.5px;
}

/* Sets up image frame */
.img_frame {
  position: relative;
  width: 100%;
  height: 320px;
  margin-bottom: 4.977px;
  background-image: linear-gradient(
    45deg,
    #cf9401,
    #f9d51e,
    #ffff7a,
    #f9d51e,
    #ffff7a,
    #cf9401
  );
  box-shadow: 5px 5px 12px 2px rgba(0, 0, 0, 0.75);
}
.img_frame:after,
.img_frame:before {
  content: "";
  display: block;
  position: absolute;
  top: 0;
  height: 3.5%;
  width: 5%;
}
.img_frame:before {
  left: 1.2%;
  background: linear-gradient(to right, rgba(170, 96, 7, 0.5), transparent);
  transform: skew(45deg);
}
.img_frame:after {
  right: 1.2%;
  background: linear-gradient(to left, rgba(170, 96, 7, 0.5), transparent);
  transform: skew(-45deg);
}

/* Sets up the look of the pokemon image being used */
.poke_img {
  position: absolute;
  width: 95%;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: 2.388%;
  background: url(http://25.media.tumblr.com/378e32d1bcde74880d177d4e31e4df72/tumblr_mu25vk7KRN1r91cn2o1_500.gif);
  background-size: cover;
}

/* Makes the frame around the image look fancier */
.poke_img:after,
.poke_img:before {
  content: "";
  display: block;
  position: absolute;
  bottom: -3.6%;
  height: 3.3%;
  width: 23%;
}
.poke_img:before {
  left: -2%;
  background: linear-gradient(to right, rgba(170, 96, 7, 0.5), transparent);
  transform: skew(-45deg);
}
.poke_img:after {
  right: -2%;
  background: linear-gradient(to left, rgba(170, 96, 7, 0.5), transparent);
  transform: skew(45deg);
}

/* Creates the gold banner behind pokemon facts */
.poke_facts {
  position: relative;
  height: 20px;
  margin: 0 19px;
  text-align: center;
  background-image: linear-gradient(
    to top,
    #fff85d,
    #fbde02 10%,
    #ba7500 80%,
    #fbde02 100%
  );
}
.poke_facts:after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: 0.3% 0 0;
  background: linear-gradient(
    90deg,
    transparent,
    #cf9401 2%,
    #f9d51e,
    #ffff7a,
    #f9d51e,
    #cf9401 98%,
    transparent
  );
}
.poke_facts > span {
  position: relative;
  bottom: 0.1em;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.022em;
  font-style: italic;
  z-index: 1;
}

/* Sets up the pokemon's attack box */
.single_energy_type {
  float: left;
  border-radius: 100px;
  width: 25px;
  height: 25px;
  margin-left: 7.5%;
  margin-right: 30%;
  margin-bottom: -4.5px;
}

.single_energy_type1 {
  border-radius: 100px;
  width: 25px;
  height: 25px;
  margin-top: 2.5%;
  margin-left: 30%;
}
.multi_energy_type1 {
  float: left;
  border-radius: 100px;
  width: 25px;
  height: 25px;
  margin-top: 4%;
  margin-left: 5%;
}
.multi_energy_type2 {
  float: left;
  border-radius: 100px;
  width: 25px;
  height: 25px;
  margin-top: 4%;
  margin-left: 1%;
  margin-right: 1%;
}
.multi_energy_type3 {
  border-radius: 100px;
  width: 20px;
  height: 20px;
  margin-left: 0;
  margin-bottom: -1%;
}

.text_indent {
  margin-left: 0%;
  margin-bottom: 0;
  padding-bottom: 0;
}

.atk_damage1 {
  float: right;
  margin-top: -10%;
  margin-right: 5%;
  margin-left: -15%;
  padding: 0;
  font-weight: normal;
}

.atk_damage2 {
  float: right;
  margin-top: -15%;
  margin-right: 5%;
  margin-left: -15%;
  padding: 0;
  font-weight: normal;
}

.hr_1 {
  color: black;
  background-color: black;
  height: 1px;
  width: 90%;
}

.hr_2 {
  color: black;
  background-color: black;
  height: 1px;
  width: 90%;
  margin-top: -2.5%;
  margin-bottom: 0;
}

.attack_text {
  font-weight: bold;
  font-size: 18px;
}

/* Sets up Weakness */
.weakness {
  float: left;
  margin-top: -3%;
  margin-left: 10%;
}
/* Sets up Resistance */
.resistance {
  float: left;
  margin-top: -3%;
  margin-left: 15%;
  margin-right: 15%;
}
/* Sets up Retreat Cost */
.retreat_cost {
  float: left;
  margin-top: -3%;
}

/* Sets up the pokemon description box */
.poke_description {
  position: absolute;
  bottom: 13px;
  left: 19px;
  width: 386px;
  height: 38px;
  z-index: 1;
}
.poke_description:before,
.poke_description:after {
  content: "";
  position: absolute;
  display: block;
  height: 2px;
  left: 0;
  right: 0;
}
.poke_description:before {
  top: 0;
  background: linear-gradient(
    to right,
    #ffd234,
    #ffef64,
    #f8d130,
    #efb303,
    #a36009
  );
}
.poke_description:after {
  bottom: 0;
  background: linear-gradient(
    to right,
    #a36009,
    #efb303,
    #f8d130,
    #ffef64,
    #ffd234
  );
}
.poke_description_frame:before,
.poke_description_frame:after {
  content: "";
  position: absolute;
  display: block;
  width: 2px;
  bottom: 0;
  top: 0;
  z-index: -1;
}
.poke_description_frame:before {
  left: 0;
  background: linear-gradient(to top, #a07700, #b08409);
}
.poke_description_frame:after {
  right: 0;
  background: linear-gradient(to bottom, #a07700, #b08409);
}
.poke_description_text {
  padding: 6px 12px;
  font-size: 13.75px;
  font-weight: 700;
  letter-spacing: 0.022em;
  font-style: italic;
  line-height: 1;
  display: block;
}

p {
  margin-top: 0%;
}

/* Copywrite info */
.copyinfo {
  margin-top: 9%;
  margin-left: 2%;
  float: left;
  font-size: 0.5em;
}
</style>
