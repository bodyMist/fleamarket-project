<template>
  <v-col cols="12" md="6">
    <label>
      <h1>예약 현황</h1>
    </label>
    <v-card class="cover">
      <v-card-title>
        <v-col offset="1"> 총 예약자 수 </v-col>
        <v-col>
          <h3>{{ totalUserNum }}</h3>
        </v-col>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-title>
        <v-col offset="1"> 취소한 예약자 수 </v-col>
        <v-col>
          <h3>{{ cancelUserNum }}</h3>
        </v-col>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-title>
        <v-col offset="1"> 유효한 예약자 수 </v-col>
        <v-col>
          <h3>{{ UserNum }}</h3>
        </v-col>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-title>
        <v-col offset="1"> 예약 진행중 </v-col>
        <v-col>
          <h3>{{ curUserNum }}</h3>
        </v-col>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-title>
        <v-col offset="1"> 거래 완료 </v-col>
        <v-col>
          <h3>{{ UserNum - curUserNum }}</h3>
        </v-col>
      </v-card-title>
    </v-card>
  </v-col>
</template>

<script>
export default {
  props: {
    totalUserNum: Number,
    cancelUserNum: Number,
    UserNum: Number,
    curUserNum: Number,
  },
};
</script>

<style></style>
