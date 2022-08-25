import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton } from "@ionic/react";

const Page = ({ title = "Undefined", children }) => {
	return (
		<IonPage>
			<IonHeader translucent="true" className="mainHeader">
				<IonToolbar>
					<IonButtons slot="start" className="ionButtons">
						<IonMenuButton ></IonMenuButton>
					</IonButtons>
					<IonTitle>{title}</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent id="main">
				<IonHeader collapse="condense">
					<IonToolbar>
						<IonTitle size="large">{title}</IonTitle>
					</IonToolbar>
				</IonHeader>
				{children}
			</IonContent>
		</IonPage>
	);
};
export default Page;