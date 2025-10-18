# **App Name**: Apex Case Battles

## Core Features:

- User Authentication: Authenticate users via their Telegram ID and store essential data like balances and referral information in Firestore.
- Balance Display: Display the user's Stars and Diamonds balances at the top of the interface, pulling data from Firestore.
- Case Opening: Allow users to open cases by deducting the case price (in Stars) from their balance in Firestore and randomly selecting an item based on predefined probabilities, using a provably fair RNG.
- Item Inventory: Display the user's inventory of won items, retrieved from Firestore. Items can have a 'won', 'exchanged', or 'shipped' status.
- Referral System: Track referrals by storing the referrer's ID in the user's record in Firestore and reward referrers with a commission on their referrals' spending.
- Weekly Ranking: Rank users based on their weekly spending (Stars spent) stored in Firestore, and reset the weekly metrics using a scheduled function. Present leaderboard using the data.
- AI-Powered Item Descriptions: Leverage generative AI tool to create flavor text descriptions for newly added in-game items.
- Real NFT Integration and Transfer Logic: Allows users to win real, unique TON NFTs. This feature tracks NFTs owned by the bot, awards them to users who win them, and then transfers the NFT to the user's wallet using a cloud function.

## Style Guidelines:

- Primary color: Dark intense blue (#4681F4), reminiscent of gemstones and high value.
- Background color: Very dark desaturated blue (#121317) to set a night mode, and to put emphasis on value within the app.
- Accent color: A vibrant shade of violet (#BE79DF), 30 degrees to the 'left' of the primary color, for interactive elements.
- Body and headline font: 'Inter', sans-serif, for a clean and modern look.
- Use custom icons that are related to the case battle theme and in-game currency.
- Create a clean, modern layout, similar to the provided screenshots. Ensure content is easily accessible and well-organized, including leaderboards.
- Subtle animations and transitions when opening cases or receiving rewards.