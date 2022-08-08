import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton } from "@ionic/react";

const Page = ({ children, triggerWindowDrag }) => {
	return (
		<IonPage>
			<IonHeader translucent="true" className="mainHeader">
				<IonToolbar>
					<IonButtons slot="start" className="ionButtons">
						<IonMenuButton menu="first"></IonMenuButton>
					</IonButtons>
					<IonTitle OnMouseDown={triggerWindowDrag}>Top title</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent id="main">
				<IonHeader collapse="condense">
					<IonToolbar>
						<IonTitle size="large">Test title</IonTitle>
					</IonToolbar>
				</IonHeader>
				{children}
			</IonContent>
		</IonPage>
	);
};
export default Page;