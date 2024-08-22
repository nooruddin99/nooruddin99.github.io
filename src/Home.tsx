import { Fragment, useState, useEffect } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
// import { TonConnectButton } from '@tonconnect/ui-react';
import { initUtils, initSwipeBehavior, postEvent } from '@telegram-apps/sdk';
import "./Home.css";

// Telegram app functions initialization
const utils = initUtils();
const [swipeBehavior] = initSwipeBehavior();
// Telegram app calling methods
postEvent('web_app_expand');

// Utility function to parse URL hash and extract user data
function getUserDataFromHash(): { user_id: string; username: string; firstname: string; lastname: string; referral_code: string | undefined } | null {
  try {
    const urlHash = decodeURIComponent(window.location.hash.substring(1)); // remove '#'
    const params = new URLSearchParams(urlHash);
    const userDataEncoded = params.get('user');
    const userDataRefLink = params.get('tgWebAppData');
    const referralCode = params.get('start_param');

    // console.log("urlHash ", urlHash);
    // console.log("userDataEncoded ", userDataEncoded);
    // console.log("userDataRefLink ", userDataRefLink);
    // console.log("referralCode ", referralCode);

    if (userDataEncoded) {
      try {
        const user = JSON.parse(userDataEncoded);
        console.log("user data userDataEncoded", user);
        return {
          user_id: user.id,
          username: user.username,
          firstname: user.first_name,
          lastname: user.last_name,
          referral_code: ""
        };
      } catch (e) {
        console.error("Failed to parse user data", e);
        return null;
      }
    }

    if (userDataRefLink && referralCode) {
      try {
        // Remove the 'user=' prefix and get the JSON string
        const userDataString = userDataRefLink.replace('user=', '');

        const user = JSON.parse(userDataString);
        console.log("user data userDataRefLink", user);
        return {
          user_id: user.id,
          username: user.username,
          firstname: user.first_name,
          lastname: user.last_name,
          referral_code: referralCode?.toString()
        };
      } catch (e) {
        console.error("Failed to parse user data", e);
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting user data:', error);
    return null;
  }
}

function Home() {
  const {
    unityProvider,
    isLoaded,
    sendMessage,
    loadingProgression
  } = useUnityContext({
    loaderUrl: "Build/Builds.loader.js",
    dataUrl: "Build/Builds.data",
    frameworkUrl: "Build/Builds.framework.js",
    codeUrl: "Build/Builds.wasm",
  });

  const [loading, setLoading] = useState(true);
  // const [showTonConnectButton, setShowTonConnectButton] = useState(false);
  if (swipeBehavior.supports("disableVerticalSwipe")) {
    swipeBehavior.disableVerticalSwipe();
  }

  useEffect(() => {
    if (isLoaded) {
      setLoading(false);
      const userData = getUserDataFromHash();
      console.log("user data ", userData);

      if (userData) {
        sendMessage('WebToUnityController', 'SetUserData', JSON.stringify(userData));
      }
    }
  }, [isLoaded, sendMessage]);

  // SendInviteLinkToWebGL: listens for "inviteLink" messages from Unity
  const handleInviteLinkFromUnity = ({ detail }: CustomEvent<{ inviteLink: string }>) => {
    const { inviteLink } = detail;
    console.log("Received inviteLink from Unity:", inviteLink);

    if (inviteLink) {
      console.log("inviteLink: ", inviteLink);
      utils.openTelegramLink(inviteLink);
      detail.inviteLink = "";
    }
  };
  useEffect(() => {

    window.addEventListener('SendInviteLink', handleInviteLinkFromUnity as EventListener);

    return () => {
      window.removeEventListener('SendInviteLink', handleInviteLinkFromUnity as EventListener);
    };
  }, []);

  // useEffect(() => {
  //   // Define the event handler
  //   const handleSendFlagToWebGL = (event: CustomEvent<{ flag: string }>) => {
  //     const flag = event.detail.flag === "true";
  //     console.log("flag status: ", flag);
  //     setShowTonConnectButton(flag); // Update state based on flag
  //   };

  //   // Add event listener
  //   window.addEventListener('SendFlagToWebGL', handleSendFlagToWebGL as EventListener);

  //   // Cleanup event listener on component unmount
  //   return () => {
  //     window.removeEventListener('SendFlagToWebGL', handleSendFlagToWebGL as EventListener);
  //   };
  // }, []);

  function displayUnity() {
    return (
      <Fragment>
        <style>
          {`
            html, body, #root {
              margin: 0;
              padding: 0;
              height: 100%;
              overflow: hidden;
            }
          `}
        </style>
        <Unity
          unityProvider={unityProvider}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
          }}
        />
        {loading && (
          <div className="loading-dialog">
            <h2 className="loading-h2">LOADING</h2>
            <div className="loading-bar">
              <div className="loading-progress" style={{ width: `${loadingProgression * 100}%` }}></div>
            </div>
          </div>
        )}
        {/* {showTonConnectButton && (
          <div style={{
            position: "fixed",
            top: "35px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000 // Ensure the button is above other content
          }}>
            <TonConnectButton className="my-button-class" />
          </div>
        )} */}
      </Fragment>
    );
  }

  return <div>{displayUnity()}</div>;
}

export default Home;
