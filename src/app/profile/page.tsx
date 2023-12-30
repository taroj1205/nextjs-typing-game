import { UserProfile } from "@clerk/nextjs";

const Profile = () => {
  return (
		<div className="max-w-[90svw] mx-auto my-auto p-4">
			<UserProfile />
		</div>
	);
};

export default Profile;