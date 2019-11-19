<template>
<f7-page name="profile">
  <!-- Top Navbar -->
  <f7-navbar v-if="isOwnProfile" back-link="Back" title="My Profile" :sliding="false">
  </f7-navbar>


  <!-- Top Navbar -->
  <f7-navbar v-else :sliding="false" title="" back-link="Back"></f7-navbar>

  <f7-block>
    <f7-row>
      <f7-col width="33">
        <img class="profile-picture" :src="'../static/people/' + person.picture" />
      </f7-col>
      <f7-col width="66">
        <h2>{{person.firstName}} {{person.lastName}}</h2>
        <p>{{person.email}}</p>
      </f7-col>
    </f7-row>
    <f7-row>
      <p> {{person.description}}
      </p>
    </f7-row>
    <f7-row>
      <f7-block>
        <h3>Friends</h3>
        <user-chip v-for="friend in getFriends(person.id)" :key="friend.id" :initials="false" :user="friend"></user-chip>
      </f7-block>
    </f7-row>
    <template v-if="!isOwnProfile">
      <f7-row>
        <f7-block>
          <h3>Trips of {{person.firstName}}</h3>
        </f7-block>
      </f7-row>
      <trip-card v-for="trip in myTrips" :key="trip.id" :trip="trip" :participants="getTripParticipants(trip.id)"></trip-card>
    </template>
    <!-- Showing edit control only for the user itself -->
    <template v-if="isOwnProfile">
      <f7-row tag="p">
        <f7-col tag="span">
          <f7-button large>Edit Profile</f7-button>
        </f7-col>
      </f7-row>
      <f7-row tag="p">
        <f7-col tag="span">
          <f7-button large>User Terms</f7-button>
        </f7-col>
      </f7-row>
      <f7-row tag="p">
        <f7-col tag="span">
          <f7-button large color="red">Log Out</f7-button>
        </f7-col>
      </f7-row>
    </template>
  </f7-block>

</f7-page>
</template>

<script>
import UserChip from '../components/user-chip';
import TripCard from '../components/trip-card';

export default {
  data: function() {
    let personId = this.$f7route.params.id;
    // alert(personId);
    let currentPerson;
    currentPerson = this.$f7.data.people.find(
      (person) => {
        return person.id == personId
      });
    // alert(JSON.stringify(currentPerson));
    return {
      person: currentPerson,
      userId: this.$f7.data.userId
    };
  },
  computed: {
    isOwnProfile: function() {
      return this.person.id == this.userId;
    },
    myTrips: function() {
      let profileId = this.person.id;
      return this.$f7.data.trips.filter(
        function(trip) {
          return trip.owner == profileId;
        }
      );
    }
  },
  methods: {
    getFriends: function(personId) {
      let idFriends = this.$f7.data.people.find(
        (person) => {
          return person.id == personId
        }).friends;
      return (this.$f7.data.people.filter(
        function(person) {
          return idFriends.includes(person.id);
        }
      ));
    },
    getTripParticipants: function(tripId) {
      let idParticipants = this.$f7.data.trips.find(
        (trip) => {
          return trip.id == tripId
        }).participants;
      // alert(idParticipants)
      return (this.$f7.data.people.filter(
        function(person) {
          return idParticipants.includes(person.id);
        }
      ));
    }
  },
  components: {
    'user-chip': UserChip,
    'trip-card': TripCard
  }
};
</script>

<style scoped>
.profile-picture {
  width: 100%;
  border-radius: 100%;
}
</style>
