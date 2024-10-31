<template>
  <div class="fixed inset-0 pointer-events-none z-10">
    <div class="pyro">
      <div class="before"></div>
      <div class="after"></div>
    </div>
  </div>
</template>

<style>
.pyro > .before,
.pyro > .after {
  position: fixed;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  box-shadow: 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff,
    0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff,
    0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff, 0 0 #fff;
  animation: 1s bang ease-out infinite backwards,
    1s gravity ease-in infinite backwards, 5s position linear infinite backwards;
}

.pyro > .after {
  animation-delay: 1.25s, 1.25s, 1.25s;
  animation-duration: 1.25s, 1.25s, 6.25s;
}

@keyframes bang {
  to {
    box-shadow: -93px -44.666667px #00ff73, 137px -106.666667px #a6ff00,
      -81px -286.666667px #ff00c8, 87px -146.666667px #ff006a,
      -89px -146.666667px #ff00bf, 127px -416.666667px #ff4800,
      -163px -346.666667px #ff6600, 47px 23.333333px #00ff15,
      -13px -176.666667px #ff5900, -123px -366.666667px #00ffbb,
      -157px -426.666667px #00ff73, -163px -216.666667px #00ff8c,
      67px -326.666667px #0091ff, -143px -196.666667px #ff0400,
      -61px -156.666667px #ff00e6, 137px -376.666667px #ff006a,
      -33px -246.666667px #00ff8c, -123px -86.666667px #00ff33,
      -3px -336.666667px #00ff15, -57px -26.666667px #00ff73;
  }
}

@keyframes gravity {
  to {
    transform: translateY(200px);
    opacity: 0;
  }
}

@keyframes position {
  0%,
  19.9% {
    margin-top: 10%;
    margin-left: 40%;
  }
  20%,
  39.9% {
    margin-top: 40%;
    margin-left: 30%;
  }
  40%,
  59.9% {
    margin-top: 20%;
    margin-left: 70%;
  }
  60%,
  79.9% {
    margin-top: 30%;
    margin-left: 20%;
  }
  80%,
  99.9% {
    margin-top: 30%;
    margin-left: 80%;
  }
}
</style>
