import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from "@ionic/react";

const Page = ({children}) => {
	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonTitle>Test title</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent>
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