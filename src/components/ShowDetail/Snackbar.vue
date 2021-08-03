<template>
  <!-- 스낵바 -->
  <v-snackbar class="snackbar" v-model="snackbar" :timeout="timeout" bottom>
    {{ this.text }}

    <template v-slot:action="{ attrs }">
      <v-btn color="blue" text v-bind="attrs" @click="this.snackbar = false">
        닫기
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
export default {
  props: {
    snackbar: Boolean,
    text: String,
  },
  data() {
    return {
      timeout: 1000,
    };
  },
};
</script>

<style>
.snackbar {
  margin-bottom: 5vh;
}
</style>
