<template>
  <div>
    <h2>Dashboard</h2>
    <p>Name: {{ user.name }}</p>
  </div>
</template>
<script>
import axios from "axios";
import router from "../router";
export default {
  name: "Login",
  data() {
    return {
      user: {
        name: "Jesse"
      }
    };
  },
  methods: {
    getUserData: function() {
      let self = this;
      axios
        .get("/api/user")
        .then(response => {
          console.log(response);
          self.$set(this, "user", response.data.user);
          // if the call was successful, set the user property with the data returned from the back-end using:
        })
        .catch(errors => {
          console.log(errors);
          router.push("/");
        });
    }
  },
  mounted() {
    this.getUserData();
  }
};
</script>
