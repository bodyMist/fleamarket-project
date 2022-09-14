<template>
  <v-btn large class="btnHome" color="primary" dark @click="moveHome">
    <v-icon medium color="white">mdi-home</v-icon> Home
  </v-btn>
</template>

<script>
export default {
  methods: {
    //홈화면 이동
    moveHome() {
      this.$router.push({
        name: "Enroll",
      });
    },
  },
};
</script>

<style>
.btnHome {
  cursor: pointer;
}
</style>
